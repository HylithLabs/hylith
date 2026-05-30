import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listBookedStartTimes } from "@/lib/data/assignments.repository";
import {
  getAgencyTimezone,
  getBookableDateKeysInRange,
  getOpenDateKeysInRange,
  getSlotAvailabilityForDayByKey,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const bookedStarts = await listBookedStartTimes();
  const timezone = getAgencyTimezone();

  if (dateParam) {
    const slots = await getSlotAvailabilityForDayByKey(dateParam, bookedStarts);
    return NextResponse.json({
      timezone,
      date: dateParam,
      slots: slots.map(({ startAt, bookable }) => ({
        startAt: startAt.toISOString(),
        bookable,
      })),
    });
  }

  const [bookableDays, openDays] = await Promise.all([
    getBookableDateKeysInRange(bookedStarts, 60),
    getOpenDateKeysInRange(60),
  ]);

  return NextResponse.json({
    timezone,
    bookableDays,
    openDays,
  });
}
