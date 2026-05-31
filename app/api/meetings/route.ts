import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAgencyTimezone, getSlotDurationMinutes, isValidBookableSlot } from "@/lib/availability";
import { sendMeetingEmails } from "@/lib/email";
import { createDiscoveryMeetingMeetLink, type GoogleMeetCreationResult } from "@/lib/google-calendar";
import {
  countPendingAssignments,
  createAssignment,
  hasAssignmentConflict,
  listAssignmentsForClient,
  listBookedStartTimes,
} from "@/lib/data/assignments.repository";
import { findUserByEmail } from "@/lib/data/users.repository";

const createSchema = z.object({
  startAt: z.string().datetime(),
  name: z.string().trim().min(1).max(200).optional(),
  company: z.string().trim().min(1, "Company is required").max(200),
  companyUrl: z.string().trim().min(1, "Company URL is required").max(500),
  services: z.array(z.string()).min(1, "Select at least one service"),
  budget: z.string().trim().min(1, "Budget is required").max(100),
  projectStatus: z.string().trim().min(1, "Project status is required").max(100),
  deadline: z.string().trim().min(1, "Deadline is required").max(200),
  projectDescription: z.string().trim().min(10).max(5000),
  guests: z.array(z.string().email()).default([]),
});

const MAX_PENDING = 1;

export const runtime = "nodejs";

async function getSessionJsonSafe() {
  try {
    return await auth();
  } catch (error) {
    console.error("Auth session error in meetings route:", error);
    return null;
  }
}

export async function GET() {
  const session = await getSessionJsonSafe();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await findUserByEmail(session.user.email);
    const clientId = dbUser?.id ?? session.user.id;
    const meetings = await listAssignmentsForClient(clientId);
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("List meetings error:", error);
    return NextResponse.json({ error: "Failed to load meetings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionJsonSafe();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { startAt: startAtStr, name, company, companyUrl, services, budget, projectStatus, deadline, projectDescription, guests } = parsed.data;
    const startAt = new Date(startAtStr);
    const timezone = getAgencyTimezone();
    const clientName = name || session.user.name || session.user.email;
    const dbUser = await findUserByEmail(session.user.email);
    const clientId = dbUser?.id ?? session.user.id;

    const [pendingCount, bookedStarts, hasConflict] = await Promise.all([
      countPendingAssignments(clientId),
      listBookedStartTimes(),
      hasAssignmentConflict(startAt),
    ]);

    if (pendingCount >= MAX_PENDING) {
      return NextResponse.json(
        { error: "You already have a pending meeting. Wait until it is closed before scheduling another." },
        { status: 429 },
      );
    }

    if (!(await isValidBookableSlot(startAt, bookedStarts))) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    if (hasConflict) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
    }

    // Serialize all form fields into project_summary as JSON
    const projectSummary = JSON.stringify({
      description: projectDescription,
      companyUrl,
      services,
      budget,
      projectStatus,
      deadline,
      guests,
    });

    const meeting = await createAssignment({
      clientId,
      email: session.user.email,
      name: clientName,
      startAt,
      timezone,
      projectSummary,
      company,
      phone: companyUrl, // store URL in phone column (nullable varchar)
    });

    let calendarResult: GoogleMeetCreationResult = {
      eventId: null,
      meetLink: null,
      success: false,
    };
    let emailsSent: boolean | null = null;

    try {
      const slotDurationMinutes = await getSlotDurationMinutes();
      const meetingStartAt = new Date(meeting.startAt);
      const meetingEndAt = addMinutes(meetingStartAt, slotDurationMinutes);

      calendarResult = await createDiscoveryMeetingMeetLink({
        startDateTime: meetingStartAt.toISOString(),
        endDateTime: meetingEndAt.toISOString(),
      });
    } catch (calendarError) {
      console.error("Meeting saved but Meet link generation failed:", calendarError);
    }

    try {
      const emailResult = await sendMeetingEmails({
        clientName: meeting.name,
        clientEmail: meeting.email,
        startAt: new Date(meeting.startAt),
        timezone: meeting.timezone,
        projectSummary: meeting.projectSummary,
        company: meeting.company ?? undefined,
        companyUrl,
        services,
        budget,
        projectStatus,
        deadline,
        guests,
        meetLink: calendarResult.meetLink ?? undefined,
      });
      emailsSent = !("skipped" in emailResult && emailResult.skipped);
    } catch (emailError) {
      console.error("Meeting saved but emails failed:", emailError);
      emailsSent = false;
    }

    return NextResponse.json(
      {
        meeting,
        emailsSent,
        eventId: calendarResult.eventId,
        meetLink: calendarResult.meetLink,
        success: calendarResult.success,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create meeting error:", error);
    const message = error instanceof Error ? error.message : "Failed to create meeting request";
    return NextResponse.json(
      { error: message.includes("Supabase") || message.includes("database") ? "Database error. Try again." : "Failed to create meeting request" },
      { status: 500 },
    );
  }
}
