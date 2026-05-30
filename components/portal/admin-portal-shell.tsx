import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/portal/sign-out-button";

export function AdminPortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-portal-shell flex min-h-screen w-full flex-col bg-[#EEEEE8] font-[family-name:var(--font-dm-sans)] text-foreground antialiased">
      <header className="w-full shrink-0 border-b border-border/80 bg-[#EEEEE8]/95 backdrop-blur-sm">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="Hylith"
              width={80}
              height={20}
              className="sm:hidden md:block lg:block xl:block"
              priority
            />
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
