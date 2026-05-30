import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

const tokenClients = new Map<string, SupabaseClient>();

export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}

/** Reuses one browser client per access token (fewer Realtime auth handshakes). */
export function getSupabaseBrowserWithToken(accessToken: string): SupabaseClient {
  const cached = tokenClients.get(accessToken);
  if (cached) return cached;

  const client = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  tokenClients.set(accessToken, client);

  if (tokenClients.size > 3) {
    const oldest = tokenClients.keys().next().value;
    if (oldest) tokenClients.delete(oldest);
  }

  return client;
}
