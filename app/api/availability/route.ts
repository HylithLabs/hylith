import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import {
  getAgencyTimezone,
  getBookableDateKeysInRange,
  getSlotsForDayByKey,
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
    const slots = await getSlotsForDayByKey(dateParam, bookedStarts);
    return NextResponse.json({
      timezone,
      date: dateParam,
      slots: slots.map((s) => s.toISOString()),
    });
  }

  const bookableDays = await getBookableDateKeysInRange(bookedStarts, 60);

  return NextResponse.json({
    timezone,
    bookableDays,
  });
}
