import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <PortalShell showNav>{children}</PortalShell>
    </AuthSessionProvider>
  );
}
