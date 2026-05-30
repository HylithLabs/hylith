"use client";

import { useQuery } from "@tanstack/react-query";
import { PORTAL_STALE_TIME_MS } from "@/lib/query/config";
import { queryKeys } from "@/lib/query/keys";
import type { MeetingItem } from "@/components/portal/meetings-list";

async function fetchClientMeetings(): Promise<MeetingItem[]> {
  const res = await fetch("/api/meetings", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load meetings");
  const data = await res.json();
  const meetings = data.meetings ?? [];
  return meetings.map(
    (m: {
      _id: string;
      startAt: string;
      timezone: string;
      status: MeetingItem["status"];
      projectSummary: string;
    }) => ({
      _id: m._id,
      startAt: m.startAt,
      timezone: m.timezone,
      status: m.status,
      projectSummary: m.projectSummary,
    }),
  );
}

/** Client meetings — SSR seed + Supabase Realtime cache patches (no polling). */
export function useClientMeetings(initialMeetings?: MeetingItem[]) {
  return useQuery({
    queryKey: queryKeys.clientMeetings,
    queryFn: fetchClientMeetings,
    initialData: initialMeetings,
    staleTime: PORTAL_STALE_TIME_MS,
  });
}
