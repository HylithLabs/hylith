"use client";

import { useQuery } from "@tanstack/react-query";
import { PORTAL_STALE_TIME_MS } from "@/lib/query/config";
import { queryKeys } from "@/lib/query/keys";

export type AvailabilitySettingsDto = {
  timezone: string;
  slotDurationMinutes: number;
  availableSlots: string[];
};

async function fetchAvailabilitySettings(): Promise<AvailabilitySettingsDto> {
  const res = await fetch("/api/admin/availability-settings", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch availability");
  const data = await res.json();
  return data.settings;
}

/** Admin availability settings — Supabase Realtime on `settings` table (no polling). */
export function useAdminAvailabilitySettings() {
  return useQuery({
    queryKey: queryKeys.availabilitySettings,
    queryFn: fetchAvailabilitySettings,
    staleTime: PORTAL_STALE_TIME_MS,
  });
}
