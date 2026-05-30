import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { AdminMeetingsDashboard } from "@/components/portal/admin-meetings-dashboard";
import { AdminPortalShell } from "@/components/portal/admin-portal-shell";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { RealtimeSyncProvider } from "@/components/providers/realtime-sync-provider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <AuthSessionProvider>
      <QueryProvider>
        <RealtimeSyncProvider syncSettings>
          <AdminPortalShell>
            <AdminMeetingsDashboard />
          </AdminPortalShell>
        </RealtimeSyncProvider>
      </QueryProvider>
    </AuthSessionProvider>
  );
}
