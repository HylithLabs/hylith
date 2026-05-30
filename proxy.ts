import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { isAdminEmail } from "@/lib/admin";
import { updateSession } from "@/lib/supabase/ssr/middleware";

const { auth } = NextAuth(authConfig);

function withSupabaseCookies(
  target: NextResponse,
  source: NextResponse,
) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
  return target;
}

export default auth(async (req) => {
  const supabaseResponse = await updateSession(req);

  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const userEmail = req.auth?.user?.email;
  const isAdmin = isAdminEmail(userEmail);

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set(
      "callbackUrl",
      `${pathname}${req.nextUrl.search}`,
    );
    return withSupabaseCookies(NextResponse.redirect(login), supabaseResponse);
  }

  if (pathname.startsWith("/admin") && isLoggedIn && !isAdmin) {
    return withSupabaseCookies(
      NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin)),
      supabaseResponse,
    );
  }

  if (pathname.startsWith("/dashboard") && isLoggedIn && isAdmin) {
    return withSupabaseCookies(
      NextResponse.redirect(new URL("/admin", req.nextUrl.origin)),
      supabaseResponse,
    );
  }

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set(
      "callbackUrl",
      `${pathname}${req.nextUrl.search}`,
    );
    return withSupabaseCookies(NextResponse.redirect(login), supabaseResponse);
  }

  if (
    isLoggedIn &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    const destination = isAdmin ? "/admin" : "/dashboard";
    return withSupabaseCookies(
      NextResponse.redirect(new URL(destination, req.nextUrl.origin)),
      supabaseResponse,
    );
  }

  return supabaseResponse;
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/login", "/signup"],
};
