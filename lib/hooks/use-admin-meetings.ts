"use client";

import { useQuery } from "@tanstack/react-query";
import { PORTAL_STALE_TIME_MS } from "@/lib/query/config";
import { queryKeys } from "@/lib/query/keys";
import type { AdminMeetingItem } from "@/lib/types/admin-meeting";

async function fetchAdminMeetings(): Promise<AdminMeetingItem[]> {
  const res = await fetch("/api/admin/meetings");
  if (!res.ok) throw new Error("Failed to load meetings");
  const data = await res.json();
  return data.meetings ?? [];
}

/** Admin meetings — Supabase Realtime keeps cache fresh (no polling). */
export function useAdminMeetings() {
  return useQuery({
    queryKey: queryKeys.adminMeetings,
    queryFn: fetchAdminMeetings,
    staleTime: PORTAL_STALE_TIME_MS,
  });
}
