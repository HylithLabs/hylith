"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { MeetingItem } from "@/components/portal/meetings-list";

const POLL_INTERVAL_MS = 2000;

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

/** Client meetings with 2s polling + Realtime cache updates. */
export function useClientMeetings(initialMeetings?: MeetingItem[]) {
  return useQuery({
    queryKey: queryKeys.clientMeetings,
    queryFn: fetchClientMeetings,
    placeholderData: (previousData) => previousData ?? initialMeetings,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    refetchOnMount: "always",
  });
}
