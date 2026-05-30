export type ParsedProject = {
  description: string;
  companyUrl?: string;
  services?: string[];
  budget?: string;
  projectStatus?: string;
  deadline?: string;
  guests?: string[];
  /** true when the summary was valid JSON from the new form */
  isStructured: boolean;
};

/** Parse project_summary — handles both old plain-text and new JSON format. */
export function parseProjectSummary(raw: string): ParsedProject {
  const trimmed = raw?.trim() ?? "";
  try {
    const p = JSON.parse(trimmed);
    if (p && typeof p === "object" && typeof p.description === "string") {
      return {
        description: p.description,
        companyUrl: p.companyUrl,
        services: Array.isArray(p.services) ? p.services : undefined,
        budget: p.budget,
        projectStatus: p.projectStatus,
        deadline: p.deadline,
        guests: Array.isArray(p.guests) && p.guests.length > 0 ? p.guests : undefined,
        isStructured: true,
      };
    }
  } catch {}
  return { description: trimmed || "Discovery call request", isStructured: false };
}

/** Short one-line label for tables / card headers. */
export function projectLabel(raw: string): string {
  const { description } = parseProjectSummary(raw);
  if (!description) return "Discovery call request";
  return description.length > 120 ? `${description.slice(0, 120).trim()}…` : description;
}
