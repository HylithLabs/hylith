import { formatDateLabel, formatSlotLabel } from "@/lib/availability-utils";
import { listNotificationRecipients } from "@/lib/data/notification-recipients.repository";
import { sendBulkEmail, sendEmail } from "@/lib/email/email-service";

export async function sendMeetingEmails(params: {
  clientName: string;
  clientEmail: string;
  startAt: Date;
  timezone: string;
  projectSummary: string;
  company?: string;
  phone?: string;
}) {
  const dateLabel = formatDateLabel(params.startAt, params.timezone);
  const timeLabel = formatSlotLabel(params.startAt, params.timezone);

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

  const agencySubject = `New discovery call request — ${params.clientName}`;
  const agencyBody = `A client requested a discovery call.\n\n${details}\n\nReply to confirm the time.`;

  const clientSubject = "We received your discovery call request — Hylith";
  const clientBody = `Hi ${params.clientName},\n\nThanks for booking with Hylith. We received your request for:\n${dateLabel} at ${timeLabel} (${params.timezone})\n\nWe'll confirm within 24 hours. Questions? Reply to this email or write hello@hylith.com.\n\n— Hylith`;

  const recipients = await listNotificationRecipients();
  const adminEmails = recipients.map((r) => r.email);

  if (adminEmails.length === 0) {
    console.warn(
      "No notification_recipients configured; skipping agency notification emails",
    );
  } else {
    const bulk = await sendBulkEmail(adminEmails, {
      subject: agencySubject,
      text: agencyBody,
    });
    if (bulk.skipped || bulk.failed.length > 0) {
      console.error("Agency notification failures:", bulk.failed);
    }
  }

  const clientResult = await sendEmail(
    params.clientEmail,
    clientSubject,
    clientBody,
  );

  if (!clientResult.success) {
    return {
      skipped: false,
      partialFailure: true,
      clientEmailFailed: true,
    };
  }

  return { skipped: false, partialFailure: false };
}
