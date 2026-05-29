/** Human-readable project line for dashboard (hides accidental error/autofill junk). */
export function formatMeetingSummary(summary: string): string {
  const trimmed = summary.trim();
  if (!trimmed) return "Discovery call request";

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("failed to create meeting") ||
    lower.includes("could not submit") ||
    /^website(\s*website)+$/i.test(trimmed.replace(/\s/g, ""))
  ) {
    return "Discovery call request";
  }

  if (trimmed.length > 200) {
    return `${trimmed.slice(0, 200).trim()}…`;
  }

  return trimmed;
}
