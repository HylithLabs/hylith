import type { Metadata } from "next";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-shell min-h-screen font-[family-name:var(--font-dm-sans)] text-foreground antialiased">
      {children}
    </div>
  );
}
