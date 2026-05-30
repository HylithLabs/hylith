const BREVO_API = "https://api.brevo.com/v3/smtp/email";

function getSender() {
  const domain = process.env.DOMAIN_NAME?.trim() || "hylith.com";
  return { name: "Hylith", email: `support@${domain}` };
}

function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export type BrevoPayload = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
};

export async function sendViaBrevo(payload: BrevoPayload): Promise<{ success: boolean; error?: string }> {
  if (!isBrevoConfigured()) {
    console.warn("[brevo] BREVO_API_KEY not set — email skipped");
    return { success: false, error: "BREVO_API_KEY not configured" };
  }

  const sender = getSender();

  const body = {
    sender,
    to: payload.to.map((email) => ({ email })),
    subject: payload.subject,
    textContent: payload.text,
    ...(payload.html ? { htmlContent: payload.html } : {}),
  };

  try {
    const res = await fetch(BREVO_API, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      console.error(`[brevo] ${res.status} — ${detail}`);
      return { success: false, error: `Brevo ${res.status}: ${detail}` };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    console.error("[brevo] fetch failed:", msg);
    return { success: false, error: msg };
  }
}

/** Parse AGENCY_NOTIFICATION_EMAIL env var → deduplicated array */
export function getAdminEmails(): string[] {
  return [
    ...new Set(
      (process.env.AGENCY_NOTIFICATION_EMAIL ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@")),
    ),
  ];
}
