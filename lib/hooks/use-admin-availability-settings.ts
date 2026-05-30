"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const POLL_INTERVAL_MS = 2000;

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

export function useAdminAvailabilitySettings() {
  return useQuery({
    queryKey: queryKeys.availabilitySettings,
    queryFn: fetchAvailabilitySettings,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}
