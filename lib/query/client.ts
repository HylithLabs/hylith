"use client";

import { QueryClient } from "@tanstack/react-query";
import { PORTAL_GC_TIME_MS, PORTAL_STALE_TIME_MS } from "@/lib/query/config";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: PORTAL_STALE_TIME_MS,
        gcTime: PORTAL_GC_TIME_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
