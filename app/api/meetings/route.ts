import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import {
  getAgencyTimezone,
  isValidBookableSlot,
} from "@/lib/availability";
import { sendMeetingEmails } from "@/lib/email";

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

  await connectMongoose();
  const meetings = await Meeting.find({ userId: session.user.id })
    .sort({ startAt: 1 })
    .lean();

  return NextResponse.json({ meetings });
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

    await connectMongoose();

    const pendingCount = await Meeting.countDocuments({
      userId: session.user.id,
      status: "pending",
    });
    if (pendingCount >= MAX_PENDING) {
      return NextResponse.json(
        { error: "You already have a pending meeting. Wait until it is closed before scheduling another." },
        { status: 429 },
      );
    }

    const booked = await Meeting.find({
      status: { $in: ["pending", "confirmed"] },
    }).select("startAt");
    const bookedStarts = booked.map((m) => m.startAt);

    if (!(await isValidBookableSlot(startAt, bookedStarts))) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 },
      );
    }

    const conflict = await Meeting.findOne({
      startAt,
      status: { $in: ["pending", "confirmed"] },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 },
      );
    }

    const meeting = await Meeting.create({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      startAt,
      timezone,
      projectSummary: parsed.data.projectSummary,
      company: parsed.data.company,
      phone: parsed.data.phone,
    });

    let emailsSent = false;
    try {
      const emailResult = await sendMeetingEmails({
        clientName: meeting.name,
        clientEmail: meeting.email,
        startAt: meeting.startAt,
        timezone: meeting.timezone,
        projectSummary: meeting.projectSummary,
        company: meeting.company ?? undefined,
        phone: meeting.phone ?? undefined,
      });
      emailsSent = !emailResult.skipped;
    } catch (emailError) {
      // Booking is saved even if SMTP is down or misconfigured
      console.error("Meeting saved but emails failed:", emailError);
    }

    return NextResponse.json(
      { meeting, emailsSent },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create meeting error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create meeting request";
    return NextResponse.json(
      { error: message.includes("Mongo") ? "Database error. Try again." : "Failed to create meeting request" },
      { status: 500 },
    );
  }
}
