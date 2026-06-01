type SendMailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getMailFrom());
}

export function getMailFrom() {
  return process.env.EMAIL_FROM ?? "noreply@hylith.com";
}

export async function sendMail(input: SendMailInput) {
  if (!isResendConfigured()) {
    throw new Error("Resend is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getMailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend send failed: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<{ id: string }>;
}
