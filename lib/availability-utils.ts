import { addDays, format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { AGENCY_TIMEZONE } from "@/lib/availability-constants";

export function formatSlotDateKey(iso: string | Date, timezone = AGENCY_TIMEZONE) {
  return format(toZonedTime(new Date(iso), timezone), "yyyy-MM-dd");
}

export function formatSlotTimeKey(iso: string | Date, timezone = AGENCY_TIMEZONE) {
  return format(toZonedTime(new Date(iso), timezone), "HH:mm");
}

export function formatSlotLabel(date: Date, timezone: string) {
  return format(toZonedTime(date, timezone), "h:mm a");
}

export function formatDateLabel(date: Date, timezone: string) {
  return format(toZonedTime(date, timezone), "EEEE, MMMM d, yyyy");
}

/** Today's calendar date in Asia/Dhaka as yyyy-MM-dd. */
export function todayDateKey(timezone = AGENCY_TIMEZONE) {
  return format(toZonedTime(new Date(), timezone), "yyyy-MM-dd");
}

/** Future calendar dates in Asia/Dhaka (inclusive of today). */
export function getFutureDateKeys(daysAhead = 60, timezone = AGENCY_TIMEZONE) {
  const keys: string[] = [];
  const start = fromZonedTime(`${todayDateKey(timezone)}T00:00:00`, timezone);
  for (let i = 0; i <= daysAhead; i++) {
    keys.push(format(toZonedTime(addDays(start, i), timezone), "yyyy-MM-dd"));
  }
  return keys;
}

/** UTC instant for a wall-clock slot on a given date in Asia/Dhaka. */
export function slotIsoFromDateAndTime(dateKey: string, timeKey: string) {
  return fromZonedTime(`${dateKey}T${timeKey}:00`, AGENCY_TIMEZONE).toISOString();
}
