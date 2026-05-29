import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/portal/sign-out-button";

export function PortalShell({
  children,
  showNav = false,
}: {
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="portal-shell min-h-screen bg-[#EEEEE8] font-[family-name:var(--font-dm-sans)] text-foreground antialiased">
      <header className="border-b border-border bg-[#EEEEE8]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href={showNav ? "/dashboard" : "/"} className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="Hylith"
              width={120}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>
          {showNav ? (
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/schedule"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Schedule
              </Link>
              <SignOutButton />
            </nav>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </div>
  );
}
