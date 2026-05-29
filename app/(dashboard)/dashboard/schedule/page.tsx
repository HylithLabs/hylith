import { ScheduleForm } from "@/components/portal/schedule-form";

export default function SchedulePage() {
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
