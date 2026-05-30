import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}

export function getSupabaseBrowserWithToken(accessToken: string): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
