import { auth } from "@/lib/auth";
import { listAssignmentsForClient } from "@/lib/data/assignments.repository";
import { ClientDashboardLive } from "@/components/portal/client-dashboard-live";
import { DashboardDataProvider } from "@/components/providers/dashboard-data-provider";
import type { MeetingItem } from "@/components/portal/meetings-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="text-center text-red-600">Session not found</div>;
  }
  const name = session.user.name?.split(" ")[0] ?? "there";

  const docs = await listAssignmentsForClient(session.user.id);

  const meetings: MeetingItem[] = docs.map((m) => ({
    _id: m._id,
    startAt: m.startAt,
    timezone: m.timezone,
    status: m.status,
    projectSummary: m.projectSummary,
  }));

  return (
    <DashboardDataProvider userId={session.user.id}>
      <ClientDashboardLive userName={name} initialMeetings={meetings} />
    </DashboardDataProvider>
  );
}
