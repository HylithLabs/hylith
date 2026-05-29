import { ALL_SLOT_TIME_LABELS } from "@/lib/availability-constants";
import {
  getFutureDateKeys,
  slotIsoFromDateAndTime,
} from "@/lib/availability-utils";

export { getFutureDateKeys, todayDateKey } from "@/lib/availability-utils";

/** All 30-min slots for a calendar day (Asia/Dhaka), as ISO strings. */
export function generateCandidateSlotsForDay(dateKey: string): string[] {
  return ALL_SLOT_TIME_LABELS.map((time) => slotIsoFromDateAndTime(dateKey, time));
}

export { ALL_SLOT_TIME_LABELS };
