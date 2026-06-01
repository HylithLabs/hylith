const RESEND_API = "https://api.resend.com/emails";

function getSender() {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) {
    return from;
  }

  const domain = process.env.DOMAIN_NAME?.trim() || "hylith.com";
  return `Hylith <support@${domain}>`;
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export type BrevoPayload = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
};

export async function sendViaBrevo(
  payload: BrevoPayload,
): Promise<{ success: boolean; error?: string }> {
  if (!isResendConfigured()) {
    console.warn("[resend] RESEND_API_KEY not set — email skipped");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getSender(),
        to: payload.to.length === 1 ? payload.to[0] : payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      console.error(`[resend] ${res.status} — ${detail}`);
      return { success: false, error: `Resend ${res.status}: ${detail}` };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    console.error("[resend] fetch failed:", msg);
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
