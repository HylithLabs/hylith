import { addDays, addHours, format, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { connectMongoose } from "./mongoose";
import { AvailabilitySettings } from "@/models/availability-settings";
import {
  AGENCY_TIMEZONE,
  ALL_SLOT_TIME_LABELS,
  SLOT_DURATION_MINUTES,
} from "./availability-constants";
import {
  formatSlotDateKey,
  getFutureDateKeys,
  todayDateKey,
} from "./availability-utils";

export {
  AGENCY_TIMEZONE,
  SLOT_DURATION_MINUTES,
  ALL_SLOT_TIME_LABELS,
} from "./availability-constants";
export { getFutureDateKeys, todayDateKey } from "./availability-utils";

const MIN_LEAD_HOURS = 24;

export async function getSettings() {
  await connectMongoose();
  let settings = await AvailabilitySettings.findOne();
  if (!settings) {
    settings = await AvailabilitySettings.create({
      timezone: AGENCY_TIMEZONE,
      availableSlots: [],
    });
  }
  return settings;
}

export function getAgencyTimezone() {
  return AGENCY_TIMEZONE;
}

export async function getSlotDurationMinutes() {
  const settings = await getSettings();
  return settings.slotDurationMinutes ?? SLOT_DURATION_MINUTES;
}

/** All 30-min slots for a calendar day (Asia/Dhaka). */
export function generateCandidateSlotsForDay(dateKey: string): Date[] {
  return ALL_SLOT_TIME_LABELS.map((time) =>
    fromZonedTime(`${dateKey}T${time}:00`, AGENCY_TIMEZONE),
  );
}

function sameSlot(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) < 60_000;
}

function toDateArray(slots: unknown): Date[] {
  if (!Array.isArray(slots)) return [];
  return slots.map((s) => new Date(s as string | Date));
}

function slotsForDateKey(
  availableSlots: Date[],
  dateKey: string,
  bookedStarts: Date[],
): Date[] {
  const nowUtc = new Date();
  const minStart = addHours(nowUtc, MIN_LEAD_HOURS);

  return availableSlots.filter((slot) => {
    if (formatSlotDateKey(slot) !== dateKey) return false;
    if (isBefore(slot, minStart)) return false;
    if (bookedStarts.some((b) => sameSlot(b, slot))) return false;
    return true;
  });
}

/** Bookable slots on a specific yyyy-MM-dd day (Asia/Dhaka). */
export async function getSlotsForDayByKey(
  dateKey: string,
  bookedStarts: Date[] = [],
): Promise<Date[]> {
  const settings = await getSettings();
  return slotsForDateKey(toDateArray(settings.availableSlots), dateKey, bookedStarts);
}

/** yyyy-MM-dd dates that have at least one bookable slot. */
export async function getBookableDateKeysInRange(
  bookedStarts: Date[] = [],
  daysAhead = 60,
): Promise<string[]> {
  const settings = await getSettings();
  const openSlots = toDateArray(settings.availableSlots);
  const keys: string[] = [];
  const start = fromZonedTime(`${todayDateKey()}T00:00:00`, AGENCY_TIMEZONE);

  for (let i = 0; i <= daysAhead; i++) {
    const dateKey = format(
      toZonedTime(addDays(start, i), AGENCY_TIMEZONE),
      "yyyy-MM-dd",
    );
    const open = slotsForDateKey(openSlots, dateKey, bookedStarts);
    if (open.length > 0) keys.push(dateKey);
  }

  return keys;
}

export async function isValidBookableSlot(
  startAt: Date,
  bookedStarts: Date[] = [],
) {
  const settings = await getSettings();
  const openSlots = toDateArray(settings.availableSlots);
  const isOpen = openSlots.some((s) => sameSlot(s, startAt));
  if (!isOpen) return false;
  if (bookedStarts.some((b) => sameSlot(b, startAt))) return false;
  return true;
}
