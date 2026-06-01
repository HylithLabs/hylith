import { auth as bffAuth } from "./auth-bff";

export const auth = bffAuth;

/**
 * BFF helper to handle client-side registration or authentication routing.
 */
export async function signIn(provider: string, options: any = {}) {
  if (typeof window !== "undefined") {
    // Client-side: redirect to login page
    window.location.href = `/login?callbackUrl=${encodeURIComponent(options.callbackUrl || "/dashboard")}`;
  }
}

/**
 * BFF helper to clear session cookies and log out securely.
 */
export async function signOut(options: any = {}) {
  if (typeof window !== "undefined") {
    // Perform POST request to NestJS logout API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    // Wipe client cookies just in case and redirect to login
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    window.location.href = options.redirectTo || "/login";
  }
}
