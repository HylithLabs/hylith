"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { RealtimeSyncProvider } from "@/components/providers/realtime-sync-provider";

/** React Query + Realtime for client schedule (availability updates live). */
export function ScheduleDataProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <RealtimeSyncProvider syncSettings subscribeAssignments={false}>
        {children}
      </RealtimeSyncProvider>
    </QueryProvider>
  );
}
