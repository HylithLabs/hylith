"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { motion, useInView, useSpring } from "motion/react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectLabel } from "@/lib/meeting-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MeetingItem } from "@/components/portal/meetings-list";

interface ClientDashboardProps {
  userName: string;
  meetings: MeetingItem[];
  className?: string;
  isRefreshing?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { damping: 30, stiffness: 100, mass: 1 });

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, isInView, value]);

  React.useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toString();
      }
    });
    return () => unsubscribe();
  }, [spring]);

  return <span ref={ref}>0</span>;
}

function StatusBadge({ status }: { status: MeetingItem["status"] }) {
  const statusConfig = {
    pending: {
      icon: AlertCircle,
      variant: "secondary" as const,
      label: "Pending",
    },
    confirmed: {
      icon: CheckCircle2,
      variant: "default" as const,
      label: "Confirmed",
    },
    closed: {
      icon: CheckCircle2,
      variant: "outline" as const,
      label: "Closed",
    },
    cancelled: {
      icon: XCircle,
      variant: "destructive" as const,
      label: "Cancelled",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1 capitalize">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

function MeetingCard({
  meeting,
  index,
}: {
  meeting: MeetingItem;
  index: number;
}) {
  const zonedDate = toZonedTime(new Date(meeting.startAt), meeting.timezone);
  const formattedDate = format(zonedDate, "MMM dd, yyyy");
  const formattedTime = format(zonedDate, "hh:mm a");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="border-border transition-shadow duration-200 hover:shadow-md">
        <CardContent className="p-5 lg:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {projectLabel(meeting.projectSummary)}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4 shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-4 shrink-0" />
                    <span>{formattedTime}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={meeting.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
    >
      <Card className="border-border bg-[#EFEFED]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            <AnimatedNumber value={value} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CtaCard({ disabled }: { disabled: boolean }) {
  const [isScheduling, setIsScheduling] = React.useState(false);

  return (
    <motion.div
    >
      <style>
        {`
          @keyframes client-dashboard-schedule-loader {
            0% {
              box-shadow: 10px 0 currentColor, -10px 0 color-mix(in srgb, currentColor 18%, transparent);
              background: currentColor;
            }
            33% {
              box-shadow: 10px 0 currentColor, -10px 0 color-mix(in srgb, currentColor 18%, transparent);
              background: color-mix(in srgb, currentColor 18%, transparent);
            }
            66% {
              box-shadow: 10px 0 color-mix(in srgb, currentColor 18%, transparent), -10px 0 currentColor;
              background: color-mix(in srgb, currentColor 18%, transparent);
            }
            100% {
              box-shadow: 10px 0 color-mix(in srgb, currentColor 18%, transparent), -10px 0 currentColor;
              background: currentColor;
            }
          }
        `}
      </style>
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F0B0A] to-[#1a1412] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <CardContent className="relative p-8">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="mb-2 text-2xl font-bold">Ready to get started?</h3>
              <p className="text-zinc-300">
                Schedule a discovery call to discuss your project needs and
                explore how we can help bring your vision to life.
              </p>
            </div>
            {disabled ? (
              <Button
                disabled
                variant="ghost"
                size="lg"
                className="w-full cursor-not-allowed rounded-full !bg-white/20 text-white hover:!bg-white/20 sm:w-auto"
              >
                Pending Meeting Exists
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="lg"
                className={cn(
                  "w-full cursor-pointer rounded-full !bg-white text-[#0F0B0A] hover:!bg-white/90 sm:w-auto",
                  isScheduling ? "pl-2 pr-5" : "px-5",
                )}
              >
                <Link
                  href="/dashboard/schedule"
                  onClick={() => setIsScheduling(true)}
                  aria-busy={isScheduling}
                  className={cn("gap-3", isScheduling ? "pl-2 pr-5" : "px-5")}
                >
                  {isScheduling && (
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full opacity-90"
                      style={{
                        animation:
                          "client-dashboard-schedule-loader 0.8s infinite linear alternate",
                      }}
                    />
                  )}
                  <span>
                    {isScheduling ? "Scheduling..." : "Schedule Discovery Call"}
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ClientDashboard({
  userName,
  meetings,
  className,
  isRefreshing = false,
}: ClientDashboardProps) {
  const pendingCount = meetings.filter((m) => m.status === "pending").length;
  const closedCount = meetings.filter((m) => m.status === "closed").length;
  const hasPendingMeeting = pendingCount > 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      className={cn("w-full space-y-8", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-2">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome back, {userName}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here&apos;s an overview of your meetings and project status
        </p>
        {isRefreshing ? (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Refreshing meetings...
          </div>
        ) : null}
      </motion.div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <StatCard
              title="Pending Meetings"
              value={pendingCount}
              icon={AlertCircle}
            />
            <StatCard
              title="Closed Meetings"
              value={closedCount}
              icon={CheckCircle2}
            />
          </div>

          <CtaCard disabled={hasPendingMeeting} />
        </div>

        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold tracking-[-0.02em] text-foreground">
            Your Meetings
          </h2>
          {meetings.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No meetings scheduled yet</p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/dashboard/schedule">
                    Schedule your first call
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting, index) => (
                <MeetingCard key={meeting._id} meeting={meeting} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
