import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { NotificationRecipientRow } from "@/lib/supabase/types";

/** In-memory fallback when Supabase is not configured (dev only). */
const memoryRecipients: NotificationRecipientRow[] = [];

export async function listNotificationRecipients(): Promise<
  NotificationRecipientRow[]
> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("notification_recipients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  return [...memoryRecipients];
}

export async function addNotificationRecipient(
  email: string,
): Promise<NotificationRecipientRow> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("notification_recipients")
      .insert({ email: normalized })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  const existing = memoryRecipients.find((r) => r.email === normalized);
  if (existing) return existing;

  const row: NotificationRecipientRow = {
    id: crypto.randomUUID(),
    email: normalized,
    created_at: new Date().toISOString(),
  };
  memoryRecipients.unshift(row);
  return row;
}

export async function deleteNotificationRecipient(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("notification_recipients")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  const idx = memoryRecipients.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  memoryRecipients.splice(idx, 1);
  return true;
}
