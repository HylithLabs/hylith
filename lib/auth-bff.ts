import { cookies } from 'next/headers';
import { apiFetch } from './api-client';

export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    permissions: string[];
  };
}

/**
 * Drop-in, edge-safe replacement for Next-Auth auth() server helper.
 * Validates session state against the decoupled NestJS identity gateway 
 * and handles transparent server-side token rotation.
 */
export async function auth(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      // Access token missing, attempt transparent refresh using refresh token
      return rotateSession();
    }

    // Call NestJS backend to verify access token and retrieve active profile
    const response = await apiFetch('/users/me');

    if (response.status === 401) {
      // Access token expired, rotate session
      return rotateSession();
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      user: {
        id: data.id,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        role: data.role || 'USER',
        permissions: data.permissions || [],
      },
    };
  } catch (err) {
    console.error('BFF auth verification error:', err);
    return null;
  }
}

/**
 * Asynchronously performs transparent refresh token rotation 
 * and syncs the new cookies back into Next.js cookie jar.
 */
async function rotateSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return null;
    }

    // Request new tokens from NestJS Auth Refresh
    const response = await apiFetch('/auth/refresh', {
      method: 'POST',
      useCredentials: true, // will pass the cookies
    });

    if (!response.ok) {
      // Refresh expired/invalidated, wipe stale cookies
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return null;
    }

    // Extract cookies from NestJS response headers to set them in Next.js
    const setCookieHeaders = response.headers.getSetCookie();
    
    if (setCookieHeaders.length > 0) {
      for (const header of setCookieHeaders) {
        // Parse simple cookie components
        const parts = header.split(';')[0].split('=');
        if (parts.length === 2) {
          const [name, value] = parts;
          cookieStore.set(name, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        }
      }
    }

    const data = await response.json();
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0],
        role: data.user.role || 'USER',
        permissions: data.user.permissions || [],
      },
    };
  } catch (err) {
    console.error('BFF auth rotation error:', err);
    return null;
  }
}
