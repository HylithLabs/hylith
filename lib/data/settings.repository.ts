import {
  AGENCY_TIMEZONE,
  SLOT_DURATION_MINUTES,
} from "@/lib/availability-constants";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PortalSettings = {
  availableSlots: string[];
  slotDurationMinutes: number;
  timezone: string;
};

const DEFAULT_SETTINGS: PortalSettings = {
  availableSlots: [],
  slotDurationMinutes: SLOT_DURATION_MINUTES,
  timezone: AGENCY_TIMEZONE,
};

function admin() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

function normalizeSlots(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      const d = new Date(s as string);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    })
    .filter((s): s is string => s !== null);
}

function rowToPortalSettings(data: {
  available_slots: unknown;
  slot_duration_minutes: number;
  timezone: string;
}): PortalSettings {
  return {
    availableSlots: normalizeSlots(data.available_slots),
    slotDurationMinutes: data.slot_duration_minutes ?? SLOT_DURATION_MINUTES,
    timezone: data.timezone ?? AGENCY_TIMEZONE,
  };
}

export async function getPortalSettings(): Promise<PortalSettings> {
  const { data, error } = await admin()
    .from("settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return rowToPortalSettings(data);
}

export async function updatePortalSettings(
  patch: Partial<PortalSettings>,
): Promise<PortalSettings> {
  const current = await getPortalSettings();
  const next = { ...current, ...patch };

  const { data, error } = await admin()
    .from("settings")
    .upsert(
      {
        id: "default",
        available_slots: next.availableSlots,
        slot_duration_minutes: next.slotDurationMinutes,
        timezone: next.timezone,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return rowToPortalSettings(data);
}
