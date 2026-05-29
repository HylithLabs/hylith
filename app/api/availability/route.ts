import { NextResponse } from "next/server";
import { addDays, startOfDay } from "date-fns";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import {
  getAgencyTimezone,
  getBookableDaysInRange,
  getSlotsForDay,
} from "@/lib/availability";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  await connectMongoose();
  const booked = await Meeting.find({
    status: { $in: ["pending", "confirmed"] },
  }).select("startAt");
  const bookedStarts = booked.map((m) => m.startAt);

  const timezone = getAgencyTimezone();

  if (dateParam) {
    const day = startOfDay(new Date(dateParam));
    const slots = getSlotsForDay(day, bookedStarts);
    return NextResponse.json({
      timezone,
      date: dateParam,
      slots: slots.map((s) => s.toISOString()),
    });
  }

  const from = startOfDay(new Date());
  const to = addDays(from, 60);
  const days = getBookableDaysInRange(from, to, bookedStarts);

  return NextResponse.json({
    timezone,
    bookableDays: days.map((d) => d.toISOString().slice(0, 10)),
  });
}
