"use client";

import { ClientDashboard } from "@/components/portal/client-dashboard";
import type { MeetingItem } from "@/components/portal/meetings-list";
import { useClientMeetings } from "@/lib/hooks/use-client-meetings";

type ClientDashboardLiveProps = {
  userName: string;
  initialMeetings: MeetingItem[];
};

/** Client dashboard with SSR seed + Supabase Realtime (no polling). */
export function ClientDashboardLive({
  userName,
  initialMeetings,
}: ClientDashboardLiveProps) {
  const { data: meetings = initialMeetings } = useClientMeetings(initialMeetings);

  return <ClientDashboard userName={userName} meetings={meetings} />;
}
