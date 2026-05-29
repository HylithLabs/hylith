import Link from "next/link";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import { MeetingsList, type MeetingItem } from "@/components/portal/meetings-list";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  await connectMongoose();
  const docs = await Meeting.find({ userId: session!.user!.id })
    .sort({ startAt: -1 })
    .lean();

  const meetings: MeetingItem[] = docs.map((m) => ({
    _id: m._id.toString(),
    startAt: m.startAt.toISOString(),
    timezone: m.timezone,
    status: m.status,
    projectSummary: m.projectSummary,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Hi, {name}
          </h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Schedule a discovery call to discuss your system, roadmap, and how
            Hylith can build your full-stack product.
          </p>
        </div>
        <Button asChild className="h-11 rounded-full px-6 font-semibold">
          <Link href="/dashboard/schedule">Schedule a discovery call</Link>
        </Button>
      </div>
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Your meetings
        </h2>
        <MeetingsList meetings={meetings} />
      </section>
    </div>
  );
}
