/** All scheduling uses Asia/Dhaka. */
export const AGENCY_TIMEZONE = "Asia/Dhaka";

export const SLOT_DURATION_MINUTES = 30;

/** Full 24h clock: 00:00 through 23:30 in 30-minute steps. */
export const WORK_START_HOUR = 0;
export const WORK_END_HOUR = 24;

/** HH:mm labels for every bookable slot in a day. */
export const ALL_SLOT_TIME_LABELS: string[] = (() => {
  const labels: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
      labels.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      );
    }
  }
  return labels;
})();
