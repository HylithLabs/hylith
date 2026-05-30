import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { NotificationRecipientRow } from "@/lib/supabase/types";

function admin() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

export async function listNotificationRecipients(): Promise<
  NotificationRecipientRow[]
> {
  const { data, error } = await admin()
    .from("notification_recipients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addNotificationRecipient(
  email: string,
): Promise<NotificationRecipientRow> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin()
    .from("notification_recipients")
    .insert({ email: normalized })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNotificationRecipient(id: string): Promise<boolean> {
  const { data, error } = await admin()
    .from("notification_recipients")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
