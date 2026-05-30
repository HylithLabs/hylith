import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listBookedStartTimes } from "@/lib/data/assignments.repository";
import {
  getAgencyTimezone,
  getBookableDateKeysInRange,
  getOpenDateKeysInRange,
  getSettings,
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

  const [bookedStarts, settings] = await Promise.all([
    listBookedStartTimes(),
    getSettings(),
  ]);
  const timezone = getAgencyTimezone();

  if (dateParam) {
    const slots = await getSlotAvailabilityForDayByKey(
      dateParam,
      bookedStarts,
      settings,
    );
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
    getBookableDateKeysInRange(bookedStarts, 60, settings),
    getOpenDateKeysInRange(60, settings),
  ]);

  return NextResponse.json({
    timezone,
    bookableDays,
    openDays,
  });
}
