import { connectMongoose } from "@/lib/mongoose";
import { AvailabilitySettings } from "@/models/availability-settings";
import {
  AGENCY_TIMEZONE,
  SLOT_DURATION_MINUTES,
} from "@/lib/availability-constants";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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

export async function getPortalSettings(): Promise<PortalSettings> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) throw error;
    if (!data) return DEFAULT_SETTINGS;

    return {
      availableSlots: (data.available_slots as string[]) ?? [],
      slotDurationMinutes: data.slot_duration_minutes ?? SLOT_DURATION_MINUTES,
      timezone: data.timezone ?? AGENCY_TIMEZONE,
    };
  }

  await connectMongoose();
  const doc = await AvailabilitySettings.findOne().lean();
  if (!doc) return DEFAULT_SETTINGS;

  return {
    availableSlots: doc.availableSlots ?? [],
    slotDurationMinutes: doc.slotDurationMinutes ?? SLOT_DURATION_MINUTES,
    timezone: doc.timezone ?? AGENCY_TIMEZONE,
  };
}

export async function updatePortalSettings(
  patch: Partial<PortalSettings>,
): Promise<PortalSettings> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const current = await getPortalSettings();
    const next = { ...current, ...patch };

    const { data, error } = await supabase
      .from("settings")
      .upsert({
        id: "default",
        available_slots: next.availableSlots,
        slot_duration_minutes: next.slotDurationMinutes,
        timezone: next.timezone,
      })
      .select("*")
      .single();

    if (error) throw error;

    return {
      availableSlots: (data.available_slots as string[]) ?? [],
      slotDurationMinutes: data.slot_duration_minutes,
      timezone: data.timezone,
    };
  }

  await connectMongoose();
  const doc = await AvailabilitySettings.findOneAndUpdate(
    {},
    {
      $set: {
        ...(patch.availableSlots !== undefined
          ? { availableSlots: patch.availableSlots }
          : {}),
        ...(patch.slotDurationMinutes !== undefined
          ? { slotDurationMinutes: patch.slotDurationMinutes }
          : {}),
        ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
      },
    },
    { upsert: true, new: true },
  ).lean();

  return {
    availableSlots: doc?.availableSlots ?? [],
    slotDurationMinutes: doc?.slotDurationMinutes ?? SLOT_DURATION_MINUTES,
    timezone: doc?.timezone ?? AGENCY_TIMEZONE,
  };
}
