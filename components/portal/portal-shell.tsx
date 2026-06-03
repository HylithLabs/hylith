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
      {showNav && (
        <header className="border-b border-border bg-[#EEEEE8]/90 backdrop-blur-sm">
          <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/assets/logo.svg"
                alt="Hylith"
                width={80}
                height={20}
                className="sm:hidden md:block lg:block xl:block"
                priority
              />
            </Link>
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
          </div>
        </header>
      )}
      <main
        className={
          showNav
            ? "w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
            : "flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-14"
        }
      >
        {children}
      </main>
    </div>
  );
}
