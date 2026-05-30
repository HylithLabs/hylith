import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/portal/sign-out-button";

export function AdminPortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-portal-shell min-h-screen bg-background font-[family-name:var(--font-dm-sans)] text-foreground antialiased">
      <header className="border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
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
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </div>
  );
}
