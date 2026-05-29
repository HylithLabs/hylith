import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import { ClientDashboard } from "@/components/portal/client-dashboard";
import type { MeetingItem } from "@/components/portal/meetings-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="text-center text-red-600">Session not found</div>;
  }
  const name = session.user.name?.split(" ")[0] ?? "there";

  await connectMongoose();
  const docs = await Meeting.find({ userId: session.user.id })
    .sort({ startAt: -1 })
    .lean();

  const meetings: MeetingItem[] = docs.map((m) => ({
    _id: m._id.toString(),
    startAt: m.startAt.toISOString(),
    timezone: m.timezone,
    status: m.status,
    projectSummary: m.projectSummary,
  }));

  return <ClientDashboard userName={name} meetings={meetings} />;
}
