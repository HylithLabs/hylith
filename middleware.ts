import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { isAdminEmail } from "@/lib/admin";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
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
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (pathname.startsWith("/dashboard") && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set(
      "callbackUrl",
      `${pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }

  if (
    isLoggedIn &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    const destination = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/login", "/signup"],
};
