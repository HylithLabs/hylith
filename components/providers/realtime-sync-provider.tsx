"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryKeys } from "@/lib/query/keys";
import { subscribeAssignmentsRealtime } from "@/lib/sync/realtime-sync";

async function fetchSupabaseToken(): Promise<string | null> {
  const res = await fetch("/api/supabase/token");
  if (res.status === 204) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return data.accessToken ?? null;
}

/** Subscribes to Supabase Realtime and keeps React Query cache in sync. */
export function RealtimeSyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: accessToken } = useQuery({
    queryKey: queryKeys.supabaseToken,
    queryFn: fetchSupabaseToken,
    staleTime: 45 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!accessToken) return;
    const handle = subscribeAssignmentsRealtime(queryClient, accessToken);
    return () => handle.unsubscribe();
  }, [accessToken, queryClient]);

  return children;
}
