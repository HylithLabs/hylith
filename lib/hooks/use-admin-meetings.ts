"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { AdminMeetingItem } from "@/lib/types/admin-meeting";

const POLL_INTERVAL_MS = 2000;

async function fetchAdminMeetings(): Promise<AdminMeetingItem[]> {
  const res = await fetch("/api/admin/meetings");
  if (!res.ok) throw new Error("Failed to load meetings");
  const data = await res.json();
  return data.meetings ?? [];
}

/** Admin meetings with 2s polling fallback (React Query). */
export function useAdminMeetings() {
  return useQuery({
    queryKey: queryKeys.adminMeetings,
    queryFn: fetchAdminMeetings,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}
