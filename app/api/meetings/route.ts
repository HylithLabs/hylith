import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAgencyTimezone, isValidBookableSlot } from "@/lib/availability";
import { sendMeetingEmails } from "@/lib/email";
import {
  countPendingAssignments,
  createAssignment,
  hasAssignmentConflict,
  listAssignmentsForClient,
  listBookedStartTimes,
} from "@/lib/data/assignments.repository";

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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meetings = await listAssignmentsForClient(session.user.id);
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("List meetings error:", error);
    return NextResponse.json({ error: "Failed to load meetings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
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

    const pendingCount = await countPendingAssignments(session.user.id);
    if (pendingCount >= MAX_PENDING) {
      return NextResponse.json(
        { error: "You already have a pending meeting. Wait until it is closed before scheduling another." },
        { status: 429 },
      );
    }

    const bookedStarts = await listBookedStartTimes();
    if (!(await isValidBookableSlot(startAt, bookedStarts))) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    if (await hasAssignmentConflict(startAt)) {
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
      clientId: session.user.id,
      email: session.user.email,
      name: clientName,
      startAt,
      timezone,
      projectSummary,
      company,
      phone: companyUrl, // store URL in phone column (nullable varchar)
    });

    let emailsSent: boolean | null = null;
    (async () => {
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
        });
        emailsSent = !("skipped" in emailResult && emailResult.skipped);
      } catch (emailError) {
        console.error("Meeting saved but emails failed:", emailError);
        emailsSent = false;
      }
    })();

    return NextResponse.json({ meeting, emailsSent }, { status: 201 });
  } catch (error) {
    console.error("Create meeting error:", error);
    const message = error instanceof Error ? error.message : "Failed to create meeting request";
    return NextResponse.json(
      { error: message.includes("Supabase") || message.includes("database") ? "Database error. Try again." : "Failed to create meeting request" },
      { status: 500 },
    );
  }
}
