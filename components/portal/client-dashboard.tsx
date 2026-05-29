"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MeetingItem } from "@/components/portal/meetings-list";

type DisplayStatus = "pending" | "completed" | "cancelled" | "confirmed";

interface ClientDashboardProps {
  userName: string;
  meetings: MeetingItem[];
  className?: string;
}

function mapDisplayStatus(status: MeetingItem["status"]): DisplayStatus {
  if (status === "closed") return "completed";
  if (status === "confirmed") return "confirmed";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function statusBadgeClass(status: DisplayStatus) {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "completed":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "confirmed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "";
  }
}

function statusLabel(status: DisplayStatus) {
  if (status === "completed") return "closed";
  return status;
}

function StatusIcon({ status }: { status: DisplayStatus }) {
  switch (status) {
    case "pending":
      return <Clock className="size-3" />;
    case "completed":
      return <CheckCircle2 className="size-3" />;
    case "confirmed":
      return <CheckCircle2 className="size-3" />;
    case "cancelled":
      return <XCircle className="size-3" />;
    default:
      return null;
  }
}

export function ClientDashboard({
  userName,
  meetings,
  className,
}: ClientDashboardProps) {
  const pendingCount = meetings.filter((m) => m.status === "pending").length;
  const closedCount = meetings.filter((m) => m.status === "closed").length;
  const hasPendingMeeting = pendingCount > 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className={cn("mx-auto w-full max-w-4xl space-y-6", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
          Welcome back, {userName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your discovery calls and track your project progress with Hylith.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                <AnimatedNumber value={pendingCount} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Awaiting your discovery call
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Closed Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                <AnimatedNumber value={closedCount} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Completed discovery calls
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Video className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    Schedule a Discovery Call
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hasPendingMeeting
                      ? "You have a pending meeting. You can schedule another once it is marked closed."
                      : "Book a time to discuss your system, roadmap, and how Hylith can help."}
                  </p>
                </div>
              </div>
              {hasPendingMeeting ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                  <AlertCircle className="size-4 shrink-0" />
                  Pending meeting active
                </div>
              ) : (
                <Button asChild size="lg" className="shrink-0 rounded-full px-6">
                  <Link href="/dashboard/schedule">Schedule Call</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-dm-sans)] tracking-[-0.02em]">
              Your Meetings
            </CardTitle>
            <CardDescription>
              View your discovery call history and upcoming sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No meetings scheduled yet</p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/dashboard/schedule">Schedule your first call</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting, index) => {
                  const zoned = toZonedTime(
                    new Date(meeting.startAt),
                    meeting.timezone,
                  );
                  const displayStatus = mapDisplayStatus(meeting.status);

                  return (
                    <motion.div
                      key={meeting._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.08 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                    >
                      <Card className="border-border p-4 transition-shadow hover:shadow-md">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="size-4" />
                              <span>{format(zoned, "MMM d, yyyy")}</span>
                              <span>·</span>
                              <Clock className="size-4" />
                              <span>{format(zoned, "h:mm a")}</span>
                            </div>
                            <p className="line-clamp-2 font-medium text-foreground">
                              {meeting.projectSummary}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "flex w-fit items-center gap-1 capitalize",
                              statusBadgeClass(displayStatus),
                            )}
                          >
                            <StatusIcon status={displayStatus} />
                            {statusLabel(displayStatus)}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
