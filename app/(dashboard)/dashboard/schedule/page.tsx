import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import { ScheduleForm } from "@/components/portal/schedule-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/schedule");
  }

  await connectMongoose();
  const pendingCount = await Meeting.countDocuments({
    userId: session.user.id,
    status: "pending",
  });

  if (pendingCount > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-[-0.03em]">
            Schedule a discovery call
          </h1>
          <p className="mt-2 text-muted-foreground">
            You already have a pending meeting request.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            You can schedule another discovery call once your current meeting is
            marked as closed by our team.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-[-0.03em]">
          Schedule a discovery call
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose a time that works for you. We will confirm by email within 24
          hours.
        </p>
      </div>
      <ScheduleForm />
    </div>
  );
}
