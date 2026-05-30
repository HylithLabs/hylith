import { formatDateLabel, formatSlotLabel } from "@/lib/availability-utils";
import { sendViaBrevo, getAdminEmails } from "@/lib/brevo";
import { logEmailAttempt } from "@/lib/data/email-logs.repository";

// ── Parse projectSummary JSON (backward-compat) ───────────────────────────────

function parseProjectSummary(raw: string): {
  description: string;
  companyUrl?: string;
  services?: string[];
  budget?: string;
  projectStatus?: string;
  deadline?: string;
  guests?: string[];
} {
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === "object" && typeof p.description === "string") return p;
  } catch {}
  return { description: raw };
}

// ── HTML templates ────────────────────────────────────────────────────────────

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { margin: 0; padding: 0; background: #f4f4f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; }
  .wrap { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
  .header { background: #0f0b0a; padding: 28px 32px; }
  .header-logo { color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
  .body { padding: 32px; }
  .body p { margin: 0 0 16px; line-height: 1.6; font-size: 15px; color: #374151; }
  .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px 24px; margin: 20px 0; }
  .box-row { display: flex; gap: 8px; margin-bottom: 10px; font-size: 14px; line-height: 1.5; }
  .box-row:last-child { margin-bottom: 0; }
  .label { color: #6b7280; min-width: 120px; flex-shrink: 0; }
  .value { color: #111827; font-weight: 500; word-break: break-word; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .chip { background: #e5e7eb; color: #374151; border-radius: 6px; padding: 3px 10px; font-size: 13px; display: inline-block; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 13px; color: #9ca3af; text-align: center; }
  .footer a { color: #6b7280; text-decoration: none; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <p class="header-logo">Hylith</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">Hylith &mdash; <a href="https://hylith.com">hylith.com</a></div>
  </div>
</body>
</html>`;
}

function row(label: string, value: string | undefined, isLink = false) {
  if (!value) return "";
  const val = isLink
    ? `<a href="${value}" style="color:#2563eb;">${value}</a>`
    : `<span class="value">${value}</span>`;
  return `<div class="box-row"><span class="label">${label}</span>${val}</div>`;
}

function clientHtml(params: {
  clientName: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
}) {
  return baseHtml(`
    <p>Hi ${params.clientName},</p>
    <p>Thanks for booking a discovery call with Hylith. Here's a summary of your request:</p>
    <div class="box">
      ${row("Date", params.dateLabel)}
      ${row("Time", `${params.timeLabel} (${params.timezone})`)}
    </div>
    <p>We'll review your request and confirm within 24 hours. If you have any questions in the meantime, just reply to this email.</p>
    <p style="margin-top:24px;">— The Hylith Team</p>
  `);
}

function adminHtml(params: {
  clientName: string;
  clientEmail: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
  company?: string;
  companyUrl?: string;
  services?: string[];
  budget?: string;
  projectStatus?: string;
  deadline?: string;
  description: string;
  guests?: string[];
}) {
  const chipsHtml =
    params.services && params.services.length > 0
      ? `<div class="box-row"><span class="label">Services</span><div class="chip-row">${params.services.map((s) => `<span class="chip">${s}</span>`).join("")}</div></div>`
      : "";

  const guestsHtml =
    params.guests && params.guests.length > 0
      ? `<div class="box-row"><span class="label">Guests</span><span class="value">${params.guests.join(", ")}</span></div>`
      : "";

  return baseHtml(`
    <p style="font-size:17px;font-weight:600;color:#111;">New discovery call request</p>
    <div class="box">
      ${row("Client", params.clientName)}
      ${row("Email", params.clientEmail)}
      ${row("Date", params.dateLabel)}
      ${row("Time", `${params.timeLabel} (${params.timezone})`)}
    </div>
    <hr class="divider" />
    <div class="box">
      ${row("Company", params.company)}
      ${row("Company URL", params.companyUrl, true)}
      ${row("Budget", params.budget)}
      ${row("Status", params.projectStatus)}
      ${row("Deadline", params.deadline)}
      ${chipsHtml}
      ${guestsHtml}
    </div>
    <hr class="divider" />
    <p style="font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Project description</p>
    <p style="white-space:pre-wrap;font-size:14px;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">${params.description}</p>
    <p style="font-size:14px;color:#6b7280;">Reply directly to confirm or decline the meeting.</p>
  `);
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function sendMeetingEmails(params: {
  clientName: string;
  clientEmail: string;
  startAt: Date;
  timezone: string;
  projectSummary: string;
  company?: string;
  companyUrl?: string;
  services?: string[];
  budget?: string;
  projectStatus?: string;
  deadline?: string;
  guests?: string[];
  phone?: string;
}) {
  const dateLabel = formatDateLabel(params.startAt, params.timezone);
  const timeLabel = formatSlotLabel(params.startAt, params.timezone);

  // Parse structured fields (supports both old plain text and new JSON)
  const parsed = parseProjectSummary(params.projectSummary);
  const companyUrl = params.companyUrl ?? parsed.companyUrl ?? params.phone;
  const services = params.services ?? parsed.services;
  const budget = params.budget ?? parsed.budget;
  const projectStatus = params.projectStatus ?? parsed.projectStatus;
  const deadline = params.deadline ?? parsed.deadline;
  const guests = params.guests ?? parsed.guests;
  const description = parsed.description;

  // ── Admin notification ───────────────────────────────────────────────────────

  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn("[email] No admin recipients — set AGENCY_NOTIFICATION_EMAIL in env");
  } else {
    const adminResult = await sendViaBrevo({
      to: adminEmails,
      subject: `New discovery call — ${params.clientName}`,
      text: [
        `New booking from ${params.clientName} <${params.clientEmail}>`,
        `When: ${dateLabel} at ${timeLabel} (${params.timezone})`,
        params.company ? `Company: ${params.company}` : null,
        companyUrl ? `URL: ${companyUrl}` : null,
        services?.length ? `Services: ${services.join(", ")}` : null,
        budget ? `Budget: ${budget}` : null,
        projectStatus ? `Status: ${projectStatus}` : null,
        deadline ? `Deadline: ${deadline}` : null,
        guests?.length ? `Guests: ${guests.join(", ")}` : null,
        `\nDescription:\n${description}`,
      ]
        .filter(Boolean)
        .join("\n"),
      html: adminHtml({
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        dateLabel,
        timeLabel,
        timezone: params.timezone,
        company: params.company,
        companyUrl,
        services,
        budget,
        projectStatus,
        deadline,
        description,
        guests,
      }),
    });

    await logEmailAttempt({
      recipient: adminEmails.join(", "),
      subject: `New discovery call — ${params.clientName}`,
      success: adminResult.success,
      errorMessage: adminResult.error,
      metadata: { provider: "brevo", type: "admin_notification" },
    });

    if (!adminResult.success) {
      console.error("[email] Admin notification failed:", adminResult.error);
    }
  }

  // ── Client confirmation ──────────────────────────────────────────────────────

  const clientResult = await sendViaBrevo({
    to: [params.clientEmail],
    subject: "Discovery call request received — Hylith",
    text: `Hi ${params.clientName},\n\nThanks for booking with Hylith. We received your request for:\n${dateLabel} at ${timeLabel} (${params.timezone})\n\nWe'll confirm within 24 hours. Questions? Reply to this email.\n\n— The Hylith Team`,
    html: clientHtml({
      clientName: params.clientName,
      dateLabel,
      timeLabel,
      timezone: params.timezone,
    }),
  });

  await logEmailAttempt({
    recipient: params.clientEmail,
    subject: "Discovery call request received — Hylith",
    success: clientResult.success,
    errorMessage: clientResult.error,
    metadata: { provider: "brevo", type: "client_confirmation" },
  });

  if (!clientResult.success) {
    console.error("[email] Client confirmation failed:", clientResult.error);
    return { skipped: false, partialFailure: true, clientEmailFailed: true };
  }

  return { skipped: false, partialFailure: false };
}
