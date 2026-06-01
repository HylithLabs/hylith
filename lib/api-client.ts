import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface RequestOptions extends RequestInit {
  useCredentials?: boolean;
}

/**
 * Edge-safe HTTP client that automatically handles server-to-server 
 * cookie forwarding when executed within Next.js Server Components.
 */
export async function apiFetch(path: string, options: RequestOptions = {}) {
  const url = `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  // Add default content-type for JSON
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Handle server-to-server cookie propagation
  if (options.useCredentials !== false) {
    try {
      // In server components/actions, cookies() is available
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('access_token')?.value;
      const refreshToken = cookieStore.get('refresh_token')?.value;

      const cookieList: string[] = [];
      if (accessToken) cookieList.push(`access_token=${accessToken}`);
      if (refreshToken) cookieList.push(`refresh_token=${refreshToken}`);

      if (cookieList.length > 0) {
        headers.set('Cookie', cookieList.join('; '));
      }
    } catch {
      // Fallback: cookies() throws error when called on client-side.
      // Fetch will automatically include cookies in browser-native requests
      options.credentials = 'include';
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
