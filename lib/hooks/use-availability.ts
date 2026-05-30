"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const POLL_INTERVAL_MS = 2000;

async function fetchBookableDays(): Promise<{
  bookableDays: string[];
  openDays: string[];
  timezone: string;
}> {
  const res = await fetch("/api/availability", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load available dates");
  const data = await res.json();
  return {
    bookableDays: data.bookableDays ?? [],
    openDays: data.openDays ?? data.bookableDays ?? [],
    timezone: data.timezone ?? "Asia/Dhaka",
  };
}

type SlotResponse = { startAt: string; bookable: boolean };

async function fetchSlotsForDay(dateKey: string): Promise<{
  slots: SlotResponse[];
  timezone: string;
}> {
  const res = await fetch(`/api/availability?date=${encodeURIComponent(dateKey)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load time slots");
  const data = await res.json();
  const raw = data.slots ?? [];
  const slots: SlotResponse[] = raw.map((item: string | SlotResponse) =>
    typeof item === "string"
      ? { startAt: item, bookable: true }
      : { startAt: item.startAt, bookable: Boolean(item.bookable) },
  );
  return {
    slots,
    timezone: data.timezone ?? "Asia/Dhaka",
  };
}

export function useBookableDays() {
  return useQuery({
    queryKey: queryKeys.availabilityDays,
    queryFn: fetchBookableDays,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}

export function useSlotsForDay(dateKey: string | null) {
  return useQuery({
    queryKey: queryKeys.availabilitySlots(dateKey ?? ""),
    queryFn: () => fetchSlotsForDay(dateKey!),
    enabled: Boolean(dateKey),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}
