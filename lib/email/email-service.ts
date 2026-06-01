import { sendViaBrevo } from "@/lib/brevo";
import { logEmailAttempt } from "@/lib/data/email-logs.repository";

export type EmailPayload = {
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await sendViaBrevo({ to: [to], subject, text: body, html });

  await logEmailAttempt({
    recipient: to,
    subject,
    success: result.success,
    errorMessage: result.error,
    metadata: { provider: "resend" },
  });

  return result;
}

export async function sendBulkEmail(
  recipients: string[],
  payload: EmailPayload,
): Promise<{ sent: number; failed: string[]; skipped: boolean }> {
  const unique = [
    ...new Set(recipients.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  ];

  if (unique.length === 0) return { sent: 0, failed: [], skipped: true };

  // Send one API call with all recipients.
  const result = await sendViaBrevo({
    to: unique,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  await logEmailAttempt({
    recipient: unique.join(", "),
    subject: payload.subject,
    success: result.success,
    errorMessage: result.error,
    metadata: { provider: "resend", count: unique.length },
  });

  return result.success
    ? { sent: unique.length, failed: [], skipped: false }
    : { sent: 0, failed: unique, skipped: false };
}
