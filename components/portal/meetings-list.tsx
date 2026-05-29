import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type MeetingItem = {
  _id: string;
  startAt: string;
  timezone: string;
  status: "pending" | "confirmed" | "cancelled";
  projectSummary: string;
};

function statusVariant(status: MeetingItem["status"]) {
  switch (status) {
    case "confirmed":
      return "default" as const;
    case "cancelled":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function MeetingsList({ meetings }: { meetings: MeetingItem[] }) {
  if (meetings.length === 0) {
    return (
      <Card className="border-border bg-card shadow-[0_1px_1px_rgba(15,11,10,0.05),0_4px_16px_rgba(15,11,10,0.06)]">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-dm-sans)] text-xl tracking-[-0.02em]">
            No meetings yet
          </CardTitle>
          <CardDescription>
            Book a discovery call to talk through your product, stack, and timeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/schedule">Schedule a discovery call</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m) => {
        const zoned = toZonedTime(new Date(m.startAt), m.timezone);
        return (
          <Card
            key={m._id}
            className="border-border bg-card shadow-[0_1px_1px_rgba(15,11,10,0.04)]"
          >
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium tracking-[-0.02em]">
                  {format(zoned, "EEEE, MMM d · h:mm a")}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {m.projectSummary}
                </p>
              </div>
              <Badge variant={statusVariant(m.status)} className="w-fit capitalize">
                {m.status}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
