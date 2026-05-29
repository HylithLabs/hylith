import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <PortalShell>{children}</PortalShell>
    </AuthSessionProvider>
  );
}
