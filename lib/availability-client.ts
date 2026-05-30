import { addHours, isBefore } from "date-fns";
import {
  ALL_SLOT_TIME_LABELS,
  MIN_LEAD_HOURS,
} from "@/lib/availability-constants";
import {
  getFutureDateKeys,
  slotIsoFromDateAndTime,
} from "@/lib/availability-utils";

export { getFutureDateKeys, todayDateKey } from "@/lib/availability-utils";

/** All 30-min slots for a calendar day (Asia/Dhaka), as ISO strings. */
export function generateCandidateSlotsForDay(dateKey: string): string[] {
  return ALL_SLOT_TIME_LABELS.map((time) => slotIsoFromDateAndTime(dateKey, time));
}

/** True when the slot start is already in the past (Asia/Dhaka wall times). */
export function isSlotInPast(iso: string | Date, now = new Date()) {
  return isBefore(new Date(iso), now);
}

/** Whether a client can book this slot (future + lead time). */
export function isClientSlotBookable(iso: string | Date, now = new Date()) {
  const slot = new Date(iso);
  if (isSlotInPast(slot, now)) return false;
  return !isBefore(slot, addHours(now, MIN_LEAD_HOURS));
}

export { ALL_SLOT_TIME_LABELS, MIN_LEAD_HOURS };
