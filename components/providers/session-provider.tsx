"use client";

import type { ReactNode } from "react";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  // We decoupled from NextAuth. If you need client-side session state,
  // implement a custom React context backed by `auth-bff.ts` API calls.
  // For now, this is just a passthrough.
  return <>{children}</>;
}
