"use client";

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserWithToken } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query/keys";
import type { MeetingItem } from "@/components/portal/meetings-list";
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

function rowToAdminMeeting(row: AssignmentRow): AdminMeetingItem {
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

function rowToClientMeeting(row: AssignmentRow): MeetingItem {
  return {
    _id: row.id,
    startAt: row.start_at,
    timezone: row.timezone,
    status: row.status,
    projectSummary: row.project_summary,
  };
}

function belongsToClient(row: AssignmentRow | undefined, clientId: string) {
  return row?.client_id === clientId;
}

function applyAdminAssignmentChange(
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

      const meeting = rowToAdminMeeting(row);
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

function applyClientAssignmentChange(
  queryClient: QueryClient,
  payload: RealtimePostgresChangesPayload<AssignmentRow>,
  clientId: string,
) {
  const row = payload.new as AssignmentRow | undefined;
  const oldRow = payload.old as AssignmentRow | undefined;

  if (payload.eventType === "DELETE" && oldRow && !belongsToClient(oldRow, clientId)) {
    return;
  }
  if (row && !belongsToClient(row, clientId)) return;
  if (oldRow && !row && !belongsToClient(oldRow, clientId)) return;

  queryClient.setQueryData<MeetingItem[]>(
    queryKeys.clientMeetings,
    (current = []) => {
      if (payload.eventType === "DELETE" && oldRow) {
        return current.filter((m) => m._id !== oldRow.id);
      }

      if (!row) return current;

      const meeting = rowToClientMeeting(row);
      const idx = current.findIndex((m) => m._id === meeting._id);

      if (payload.eventType === "INSERT") {
        if (idx >= 0) {
          const next = [...current];
          next[idx] = meeting;
          return next;
        }
        return [meeting, ...current].sort(
          (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
        );
      }

      if (idx === -1) {
        return [meeting, ...current].sort(
          (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
        );
      }
      const next = [...current];
      next[idx] = meeting;
      return next;
    },
  );
}

function invalidateAvailabilityCaches(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.availability });
}

export type RealtimeSyncOptions = {
  /** When set, patches this user's client meeting cache (dashboard). */
  clientId?: string;
};

export type RealtimeSyncHandle = {
  unsubscribe: () => void;
};

export function subscribeSettingsRealtime(
  queryClient: QueryClient,
  accessToken: string,
): RealtimeSyncHandle {
  const supabase = getSupabaseBrowserWithToken(accessToken);
  void supabase.realtime.setAuth(accessToken);

  const settingsChannel = supabase
    .channel("settings-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "settings" },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.availabilitySettings,
        });
        invalidateAvailabilityCaches(queryClient);
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(settingsChannel);
    },
  };
}

/** Any assignment change refreshes bookable slots (schedule page). */
export function subscribeAssignmentAvailabilityRealtime(
  queryClient: QueryClient,
  accessToken: string,
): RealtimeSyncHandle {
  const supabase = getSupabaseBrowserWithToken(accessToken);
  void supabase.realtime.setAuth(accessToken);

  const channel = supabase
    .channel("assignments-availability")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "assignments" },
      () => {
        invalidateAvailabilityCaches(queryClient);
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}

export function subscribeAssignmentsRealtime(
  queryClient: QueryClient,
  accessToken: string,
  options: RealtimeSyncOptions = {},
): RealtimeSyncHandle {
  const supabase = getSupabaseBrowserWithToken(accessToken);
  void supabase.realtime.setAuth(accessToken);
  const channels: RealtimeChannel[] = [];
  const { clientId } = options;

  const changeConfig: {
    event: "*";
    schema: "public";
    table: "assignments";
    filter?: string;
  } = {
    event: "*",
    schema: "public",
    table: "assignments",
  };

  if (clientId) {
    changeConfig.filter = `client_id=eq.${clientId}`;
  }

  const assignmentsChannel = supabase
    .channel(clientId ? `assignments-client-${clientId}` : "assignments-admin")
    .on("postgres_changes", changeConfig, (payload) => {
      const typed = payload as RealtimePostgresChangesPayload<AssignmentRow>;
      if (clientId) {
        applyClientAssignmentChange(queryClient, typed, clientId);
      } else {
        applyAdminAssignmentChange(queryClient, typed);
      }
    })
    .subscribe();

  channels.push(assignmentsChannel);

  return {
    unsubscribe: () => {
      for (const channel of channels) {
        void supabase.removeChannel(channel);
      }
    },
  };
}
