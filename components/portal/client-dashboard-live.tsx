"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
  const {
    data: meetings = initialMeetings,
    fetchStatus,
  } = useClientMeetings(initialMeetings);
  const [showLoading, setShowLoading] = useState(() => fetchStatus === "fetching");

  useEffect(() => {
    if (fetchStatus === "fetching") {
      const timeout = window.setTimeout(() => {
        setShowLoading(true);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    if (!showLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowLoading(false);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [fetchStatus, showLoading]);

  return (
    <div className="relative" style={showLoading ? { paddingTop: "3.25rem" } : undefined}>
      {showLoading ? (
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            Loading meetings...
          </div>
        </div>
      ) : null}
      <ClientDashboard
        userName={userName}
        meetings={meetings}
        isRefreshing={showLoading && initialMeetings.length > 0}
      />
    </div>
  );
}
