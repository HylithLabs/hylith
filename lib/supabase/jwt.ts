import { createHmac } from "crypto";
import { getSupabaseJwtSecret } from "@/lib/supabase/config";

type PortalJwtPayload = {
  sub: string;
  email: string;
  role: "admin" | "user";
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Signs a short-lived JWT for Supabase RLS (HS256, project JWT secret). */
export function signSupabaseAccessToken(
  payload: PortalJwtPayload,
  expiresInSeconds = 3600,
): string | null {
  const secret = getSupabaseJwtSecret();
  if (!secret) return null;

  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64Url(
    JSON.stringify({
      ...payload,
      aud: "authenticated",
      role: "authenticated",
      iat: now,
      exp: now + expiresInSeconds,
    }),
  );

  const data = `${header}.${body}`;
  const signature = createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}
