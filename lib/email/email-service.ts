import { getMailFrom, getSmtpTransporter } from "@/lib/mail";
import { logEmailAttempt } from "@/lib/data/email-logs.repository";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

export type EmailPayload = {
  subject: string;
  text: string;
  html?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(
  to: string,
  payload: EmailPayload,
): Promise<{ success: boolean; error?: string }> {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    return { success: false, error: "SMTP not configured" };
  }

  const from = getMailFrom();
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
      await logEmailAttempt({
        recipient: to,
        subject: payload.subject,
        success: true,
        metadata: { attempt },
      });
      return { success: true };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Send failed";
      if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  await logEmailAttempt({
    recipient: to,
    subject: payload.subject,
    success: false,
    errorMessage: lastError,
    metadata: { attempts: MAX_ATTEMPTS },
  });

  return { success: false, error: lastError };
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  return sendWithRetry(to, { subject, text: body });
}

export async function sendBulkEmail(
  recipients: string[],
  payload: EmailPayload,
): Promise<{ sent: number; failed: string[]; skipped: boolean }> {
  const unique = [...new Set(recipients.map((e) => e.trim().toLowerCase()))].filter(
    Boolean,
  );

  if (unique.length === 0) {
    return { sent: 0, failed: [], skipped: true };
  }

  const failed: string[] = [];
  let sent = 0;

  for (const to of unique) {
    const result = await sendWithRetry(to, payload);
    if (result.success) sent += 1;
    else failed.push(to);
  }

  return { sent, failed, skipped: false };
}
