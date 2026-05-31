import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

const GOOGLE_MEET_SCOPE = "https://www.googleapis.com/auth/calendar";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/api/calendar/google/connect");
    return NextResponse.redirect(loginUrl);
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const clientId = process.env.CALENDAR_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.CALENDAR_GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.CALENDAR_GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Calendar Google OAuth env vars are not configured" },
      { status: 500 },
    );
  }

  const oauth2 = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
  });

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GOOGLE_MEET_SCOPE],
  });

  return NextResponse.redirect(url);
}
