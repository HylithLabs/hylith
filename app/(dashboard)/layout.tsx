import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell showNav>{children}</PortalShell>
  );
}
