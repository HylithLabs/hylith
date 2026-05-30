import { addDays, addHours, format, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { getPortalSettings } from "@/lib/data/settings.repository";
import {
  AGENCY_TIMEZONE,
  ALL_SLOT_TIME_LABELS,
  MIN_LEAD_HOURS,
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

export async function getSettings() {
  const settings = await getPortalSettings();
  return {
    availableSlots: settings.availableSlots,
    slotDurationMinutes: settings.slotDurationMinutes,
    timezone: settings.timezone,
  };
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

export type SlotAvailability = {
  startAt: Date;
  bookable: boolean;
};

function isSlotBookable(
  slot: Date,
  bookedStarts: Date[],
  nowUtc = new Date(),
) {
  const minStart = addHours(nowUtc, MIN_LEAD_HOURS);
  if (isBefore(slot, minStart)) return false;
  if (bookedStarts.some((b) => sameSlot(b, slot))) return false;
  return true;
}

/** Admin-open slots on a day that have not started yet (ignores 24h lead time). */
function openSlotsForDateKey(
  availableSlots: Date[],
  dateKey: string,
  nowUtc = new Date(),
): Date[] {
  return availableSlots.filter((slot) => {
    if (formatSlotDateKey(slot) !== dateKey) return false;
    if (isBefore(slot, nowUtc)) return false;
    return true;
  });
}

function bookableSlotsForDateKey(
  availableSlots: Date[],
  dateKey: string,
  bookedStarts: Date[],
  nowUtc = new Date(),
): Date[] {
  return openSlotsForDateKey(availableSlots, dateKey, nowUtc).filter((slot) =>
    isSlotBookable(slot, bookedStarts, nowUtc),
  );
}

/** Bookable slots on a specific yyyy-MM-dd day (Asia/Dhaka). */
export async function getSlotsForDayByKey(
  dateKey: string,
  bookedStarts: Date[] = [],
): Promise<Date[]> {
  const settings = await getSettings();
  return bookableSlotsForDateKey(
    toDateArray(settings.availableSlots),
    dateKey,
    bookedStarts,
  );
}

/** Open + bookable flags for each admin slot on a day (for client UI). */
export async function getSlotAvailabilityForDayByKey(
  dateKey: string,
  bookedStarts: Date[] = [],
): Promise<SlotAvailability[]> {
  const settings = await getSettings();
  const nowUtc = new Date();
  const openSlots = toDateArray(settings.availableSlots);

  return openSlotsForDateKey(openSlots, dateKey, nowUtc)
    .sort((a, b) => a.getTime() - b.getTime())
    .map((startAt) => ({
      startAt,
      bookable: isSlotBookable(startAt, bookedStarts, nowUtc),
    }));
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
    const open = bookableSlotsForDateKey(openSlots, dateKey, bookedStarts);
    if (open.length > 0) keys.push(dateKey);
  }

  return keys;
}

/** yyyy-MM-dd dates with any future admin-open slot (shown on client calendar). */
export async function getOpenDateKeysInRange(
  daysAhead = 60,
): Promise<string[]> {
  const settings = await getSettings();
  const openSlots = toDateArray(settings.availableSlots);
  const nowUtc = new Date();
  const keys: string[] = [];
  const start = fromZonedTime(`${todayDateKey()}T00:00:00`, AGENCY_TIMEZONE);

  for (let i = 0; i <= daysAhead; i++) {
    const dateKey = format(
      toZonedTime(addDays(start, i), AGENCY_TIMEZONE),
      "yyyy-MM-dd",
    );
    if (openSlotsForDateKey(openSlots, dateKey, nowUtc).length > 0) {
      keys.push(dateKey);
    }
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
  return isSlotBookable(startAt, bookedStarts);
}
