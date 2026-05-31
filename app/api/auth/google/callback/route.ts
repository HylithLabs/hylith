import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.json({ error: oauthError }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing Google OAuth code" }, { status: 400 });
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

  try {
    const oauth2 = new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri,
    });
    const { tokens } = await oauth2.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          error:
            "Google did not return a refresh token. Re-open /api/calendar/google/connect and approve consent again.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Calendar Google OAuth connected. Add this value to CALENDAR_GOOGLE_REFRESH_TOKEN.",
      refreshToken: tokens.refresh_token,
    });
  } catch (error) {
    console.error("[calendar] Failed to exchange Google OAuth code", error);
    return NextResponse.json({ error: "Failed to connect Google Calendar" }, { status: 500 });
  }
}
