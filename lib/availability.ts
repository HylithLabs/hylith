import {
  addDays,
  addMinutes,
  format,
  isBefore,
  isWeekend,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const SLOT_MINUTES = 30;
const WORK_START_HOUR = 10;
const WORK_END_HOUR = 18;
const MIN_LEAD_HOURS = 24;

function getTimezone() {
  return process.env.AGENCY_TIMEZONE ?? "Asia/Kolkata";
}

export function getSlotDurationMinutes() {
  return SLOT_MINUTES;
}

export function formatSlotLabel(date: Date, timezone: string) {
  return format(toZonedTime(date, timezone), "h:mm a");
}

export function formatDateLabel(date: Date, timezone: string) {
  return format(toZonedTime(date, timezone), "EEEE, MMMM d, yyyy");
}

/** Returns UTC Date instances for bookable slots on the given calendar day (agency TZ). */
export function getSlotsForDay(day: Date, bookedStarts: Date[] = []): Date[] {
  const timezone = getTimezone();
  const zonedDay = toZonedTime(day, timezone);
  const dayStart = startOfDay(zonedDay);

  if (isWeekend(dayStart)) {
    return [];
  }

  const nowUtc = new Date();
  const minStart = addHoursUtc(nowUtc, MIN_LEAD_HOURS);
  const slots: Date[] = [];

  for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const local = setMinutes(setHours(dayStart, hour), minute);
      const utc = fromZonedTime(local, timezone);

      if (isBefore(utc, minStart)) continue;

      const isBooked = bookedStarts.some(
        (b) => Math.abs(b.getTime() - utc.getTime()) < 60_000,
      );
      if (!isBooked) {
        slots.push(utc);
      }
    }
  }

  return slots;
}

function addHoursUtc(date: Date, hours: number) {
  return addMinutes(date, hours * 60);
}

/** Days in range that have at least one available slot. */
export function getBookableDaysInRange(
  from: Date,
  to: Date,
  bookedStarts: Date[] = [],
): Date[] {
  const days: Date[] = [];
  let cursor = startOfDay(from);

  while (cursor <= to) {
    const slots = getSlotsForDay(cursor, bookedStarts);
    if (slots.length > 0) {
      days.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function isValidBookableSlot(startAt: Date, bookedStarts: Date[] = []) {
  const timezone = getTimezone();
  const zoned = toZonedTime(startAt, timezone);
  const daySlots = getSlotsForDay(zoned, bookedStarts);
  return daySlots.some((s) => Math.abs(s.getTime() - startAt.getTime()) < 60_000);
}

export function getAgencyTimezone() {
  return getTimezone();
}
