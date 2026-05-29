import nodemailer, { type Transporter } from "nodemailer";

declare global {
  // eslint-disable-next-line no-var
  var _smtpTransporter: Transporter | undefined;
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD,
  );
}

export function getSmtpTransporter(): Transporter | null {
  if (!isSmtpConfigured()) return null;

  if (!global._smtpTransporter) {
    const port = Number(process.env.SMTP_PORT ?? "587");
    const secure =
      process.env.SMTP_SECURE === "true" || port === 465;

    global._smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return global._smtpTransporter;
}

export function getMailFrom() {
  return (
    process.env.SMTP_FROM ??
    process.env.SMTP_USER ??
    "noreply@hylith.com"
  );
}
