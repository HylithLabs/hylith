"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { RealtimeSyncProvider } from "@/components/providers/realtime-sync-provider";

export function DashboardDataProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  return (
    <QueryProvider>
      <RealtimeSyncProvider clientId={userId} syncSettings>
        {children}
      </RealtimeSyncProvider>
    </QueryProvider>
  );
}
