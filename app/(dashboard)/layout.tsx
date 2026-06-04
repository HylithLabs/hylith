import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { PortalShell } from "@/components/portal/portal-shell";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

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
