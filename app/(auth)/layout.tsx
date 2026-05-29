import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell>{children}</PortalShell>
  );
}
