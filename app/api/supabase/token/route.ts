import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { isSupabaseConfigured, getSupabaseJwtSecret } from "@/lib/supabase/config";
import { signSupabaseAccessToken } from "@/lib/supabase/jwt";

export async function GET() {
  if (!isSupabaseConfigured() || !getSupabaseJwtSecret()) {
    return new NextResponse(null, { status: 204 });
  }

  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth session error in supabase token route:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = isAdminEmail(session.user.email) ? "admin" : "user";
  const accessToken = signSupabaseAccessToken({
    sub: session.user.id,
    email: session.user.email,
    role,
  });

  if (!accessToken) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ accessToken });
}
