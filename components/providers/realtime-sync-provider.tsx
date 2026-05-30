"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryKeys } from "@/lib/query/keys";
import {
  subscribeAssignmentsRealtime,
  subscribeSettingsRealtime,
  type RealtimeSyncHandle,
} from "@/lib/sync/realtime-sync";

async function fetchSupabaseToken(): Promise<string | null> {
  const res = await fetch("/api/supabase/token");
  if (res.status === 204) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return data.accessToken ?? null;
}

type RealtimeSyncProviderProps = {
  children: ReactNode;
  /** Filter assignment events to this user (omit on admin for all assignments). */
  clientId?: string;
  /** Listen to `settings` table (availability). */
  syncSettings?: boolean;
  /** Listen to `assignments` table. Default true. */
  subscribeAssignments?: boolean;
};

/** Subscribes to Supabase Realtime and keeps React Query cache in sync. */
export function RealtimeSyncProvider({
  children,
  clientId,
  syncSettings = false,
  subscribeAssignments = true,
}: RealtimeSyncProviderProps) {
  const queryClient = useQueryClient();
  const { data: accessToken } = useQuery({
    queryKey: queryKeys.supabaseToken,
    queryFn: fetchSupabaseToken,
    staleTime: 45 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!accessToken) return;
    const handles: RealtimeSyncHandle[] = [];

    if (subscribeAssignments) {
      handles.push(
        subscribeAssignmentsRealtime(queryClient, accessToken, { clientId }),
      );
    }

    if (syncSettings) {
      handles.push(subscribeSettingsRealtime(queryClient, accessToken));
    }

    return () => {
      for (const handle of handles) {
        handle.unsubscribe();
      }
    };
  }, [
    accessToken,
    clientId,
    queryClient,
    syncSettings,
    subscribeAssignments,
  ]);

  return children;
}
