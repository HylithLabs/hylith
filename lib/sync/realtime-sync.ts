"use client";

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserWithToken } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query/keys";
import type { AdminMeetingItem } from "@/lib/types/admin-meeting";

type AssignmentRow = {
  id: string;
  client_id: string;
  email: string;
  name: string;
  start_at: string;
  timezone: string;
  status: AdminMeetingItem["status"];
  project_summary: string;
  company: string | null;
  phone: string | null;
  created_at: string;
};

function rowToMeeting(row: AssignmentRow): AdminMeetingItem {
  return {
    _id: row.id,
    userId: row.client_id,
    email: row.email,
    name: row.name,
    startAt: row.start_at,
    timezone: row.timezone,
    status: row.status,
    projectSummary: row.project_summary,
    company: row.company,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

function applyAssignmentChange(
  queryClient: QueryClient,
  payload: RealtimePostgresChangesPayload<AssignmentRow>,
) {
  queryClient.setQueryData<AdminMeetingItem[]>(
    queryKeys.adminMeetings,
    (current = []) => {
      const row = payload.new as AssignmentRow | undefined;
      const oldRow = payload.old as AssignmentRow | undefined;

      if (payload.eventType === "DELETE" && oldRow) {
        return current.filter((m) => m._id !== oldRow.id);
      }

      if (!row) return current;

      const meeting = rowToMeeting(row);
      const idx = current.findIndex((m) => m._id === meeting._id);

      if (payload.eventType === "INSERT") {
        if (idx >= 0) {
          const next = [...current];
          next[idx] = meeting;
          return next;
        }
        return [meeting, ...current];
      }

      if (idx === -1) return [meeting, ...current];
      const next = [...current];
      next[idx] = meeting;
      return next;
    },
  );
}

export type RealtimeSyncHandle = {
  unsubscribe: () => void;
};

export function subscribeAssignmentsRealtime(
  queryClient: QueryClient,
  accessToken: string,
): RealtimeSyncHandle {
  const supabase = getSupabaseBrowserWithToken(accessToken);
  const channels: RealtimeChannel[] = [];

  const assignmentsChannel = supabase
    .channel("assignments-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "assignments" },
      (payload) => {
        applyAssignmentChange(
          queryClient,
          payload as RealtimePostgresChangesPayload<AssignmentRow>,
        );
      },
    )
    .subscribe();

  channels.push(assignmentsChannel);

  const settingsChannel = supabase
    .channel("settings-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "settings" },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.availabilitySettings,
        });
      },
    )
    .subscribe();

  channels.push(settingsChannel);

  return {
    unsubscribe: () => {
      for (const channel of channels) {
        void supabase.removeChannel(channel);
      }
    },
  };
}
