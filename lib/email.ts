import { formatDateLabel, formatSlotLabel } from "@/lib/availability-utils";
import { getMailFrom, getSmtpTransporter } from "@/lib/mail";

function getAgencyEmail() {
  return (
    process.env.AGENCY_NOTIFICATION_EMAIL ??
    "jotirmoybhowmik1976@gmail.com"
  );
}

export async function sendMeetingEmails(params: {
  clientName: string;
  clientEmail: string;
  startAt: Date;
  timezone: string;
  projectSummary: string;
  company?: string;
  phone?: string;
}) {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    console.warn(
      "SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD); skipping emails",
    );
    return { skipped: true };
  }

  const dateLabel = formatDateLabel(params.startAt, params.timezone);
  const timeLabel = formatSlotLabel(params.startAt, params.timezone);
  const from = getMailFrom();

  const details = [
    `Client: ${params.clientName}`,
    `Email: ${params.clientEmail}`,
    `When: ${dateLabel} at ${timeLabel} (${params.timezone})`,
    `Project: ${params.projectSummary}`,
    params.company ? `Company: ${params.company}` : null,
    params.phone ? `Phone: ${params.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const results = await Promise.allSettled([
    transporter.sendMail({
      from,
      to: getAgencyEmail(),
      replyTo: params.clientEmail,
      subject: `New discovery call request — ${params.clientName}`,
      text: `A client requested a discovery call.\n\n${details}\n\nReply to confirm the time.`,
    }),
    transporter.sendMail({
      from,
      to: params.clientEmail,
      subject: "We received your discovery call request — Hylith",
      text: `Hi ${params.clientName},\n\nThanks for booking with Hylith. We received your request for:\n${dateLabel} at ${timeLabel} (${params.timezone})\n\nWe'll confirm within 24 hours. Questions? Reply to this email or write hello@hylith.com.\n\n— Hylith`,
    }),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Email sending errors:", failed.map((f) => (f as PromiseRejectedResult).reason));
  }

  return { skipped: false, partialFailure: failed.length > 0 };
}
