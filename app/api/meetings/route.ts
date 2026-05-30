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
  projectSummary: z.string().min(10).max(2000),
  company: z.string().trim().min(1, "Company is required").max(200),
  phone: z.string().trim().min(5, "Phone number is required").max(40),
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

    const startAt = new Date(parsed.data.startAt);
    const timezone = getAgencyTimezone();

    const pendingCount = await countPendingAssignments(session.user.id);
    if (pendingCount >= MAX_PENDING) {
      return NextResponse.json(
        {
          error:
            "You already have a pending meeting. Wait until it is closed before scheduling another.",
        },
        { status: 429 },
      );
    }

    const bookedStarts = await listBookedStartTimes();

    if (!(await isValidBookableSlot(startAt, bookedStarts))) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 },
      );
    }

    if (await hasAssignmentConflict(startAt)) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 },
      );
    }

    const meeting = await createAssignment({
      clientId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      startAt,
      timezone,
      projectSummary: parsed.data.projectSummary,
      company: parsed.data.company,
      phone: parsed.data.phone,
    });

    // Send emails asynchronously to avoid blocking the API response.
    // This makes the meeting submit faster for the client. We still log
    // failures from the background task.
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
          phone: meeting.phone ?? undefined,
        });
        emailsSent = !("skipped" in emailResult && emailResult.skipped);
      } catch (emailError) {
        console.error("Meeting saved but emails failed:", emailError);
        emailsSent = false;
      }
    })();

    // Return immediately; email sending continues in background.
    return NextResponse.json({ meeting, emailsSent }, { status: 201 });
  } catch (error) {
    console.error("Create meeting error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create meeting request";
    return NextResponse.json(
      {
        error: message.includes("Mongo")
          ? "Database error. Try again."
          : "Failed to create meeting request",
      },
      { status: 500 },
    );
  }
}
