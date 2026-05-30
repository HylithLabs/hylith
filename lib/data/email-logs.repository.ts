import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function logEmailAttempt(params: {
  recipient: string;
  subject: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();
  if (!isSupabaseConfigured() || !supabase) {
    console.info("[email_log]", params);
    return;
  }

  await supabase.from("email_logs").insert({
    recipient: params.recipient,
    subject: params.subject,
    success: params.success,
    error_message: params.errorMessage ?? null,
    metadata: params.metadata ?? {},
  });
}
