"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Calendar, FileText, User, Search, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAvailabilitySettings } from "@/components/portal/AdminAvailabilitySettings";
import { AdminScheduleView } from "@/components/portal/AdminScheduleView";
import { AdminWhomToSend } from "@/components/portal/AdminWhomToSend";
import { useAdminMeetings } from "@/lib/hooks/use-admin-meetings";

export type { AdminMeetingItem } from "@/lib/types/admin-meeting";
import type { AdminMeetingItem } from "@/lib/types/admin-meeting";

type BGVariantType =
  | "dots"
  | "diagonal-stripes"
  | "grid"
  | "horizontal-lines"
  | "vertical-lines"
  | "checkerboard";
type BGMaskType =
  | "fade-center"
  | "fade-edges"
  | "fade-top"
  | "fade-bottom"
  | "fade-left"
  | "fade-right"
  | "fade-x"
  | "fade-y"
  | "none";

type BGPatternProps = React.ComponentProps<"div"> & {
  variant?: BGVariantType;
  mask?: BGMaskType;
  size?: number;
  fill?: string;
};

const maskClasses: Record<BGMaskType, string> = {
  "fade-edges":
    "[mask-image:radial-gradient(ellipse_at_center,var(--background),transparent)]",
  "fade-center":
    "[mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]",
  "fade-top":
    "[mask-image:linear-gradient(to_bottom,transparent,var(--background))]",
  "fade-bottom":
    "[mask-image:linear-gradient(to_bottom,var(--background),transparent)]",
  "fade-left":
    "[mask-image:linear-gradient(to_right,transparent,var(--background))]",
  "fade-right":
    "[mask-image:linear-gradient(to_right,var(--background),transparent)]",
  "fade-x":
    "[mask-image:linear-gradient(to_right,transparent,var(--background),transparent)]",
  "fade-y":
    "[mask-image:linear-gradient(to_bottom,transparent,var(--background),transparent)]",
  none: "",
};

function getBgImage(variant: BGVariantType, fill: string, size: number) {
  switch (variant) {
    case "dots":
      return `radial-gradient(${fill} 1px, transparent 1px)`;
    case "grid":
      return `linear-gradient(to right, ${fill} 1px, transparent 1px), linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    case "diagonal-stripes":
      return `repeating-linear-gradient(45deg, ${fill}, ${fill} 1px, transparent 1px, transparent ${size}px)`;
    case "horizontal-lines":
      return `linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    case "vertical-lines":
      return `linear-gradient(to right, ${fill} 1px, transparent 1px)`;
    case "checkerboard":
      return `linear-gradient(45deg, ${fill} 25%, transparent 25%), linear-gradient(-45deg, ${fill} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${fill} 75%), linear-gradient(-45deg, transparent 75%, ${fill} 75%)`;
    default:
      return undefined;
  }
}

function BGPattern({
  variant = "grid",
  mask = "none",
  size = 24,
  fill = "#252525",
  className,
  style,
  ...props
}: BGPatternProps) {
  const bgSize = `${size}px ${size}px`;
  const backgroundImage = getBgImage(variant, fill, size);

  return (
    <div
      className={cn("absolute inset-0 z-[-10] size-full", maskClasses[mask], className)}
      style={{
        backgroundImage,
        backgroundSize: bgSize,
        ...style,
      }}
      {...props}
    />
  );
}

function statusBadgeClass(status: AdminMeetingItem["status"]) {
  if (status === "pending") {
    return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20";
  }
  if (status === "closed") {
    return "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20";
  }
  return "";
}

export function AdminMeetingsDashboard() {
  const {
    data: meetings = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useAdminMeetings();
  const [selectedMeeting, setSelectedMeeting] = useState<AdminMeetingItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadError = queryError ? "Failed to load meetings" : null;

  const filteredMeetings = meetings.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.email.toLowerCase().includes(query) ||
      m.name.toLowerCase().includes(query)
    );
  });

  const requestMeetings = filteredMeetings.filter(
    (m) => m.status === "pending" || m.status === "closed",
  );
  const pendingMeetings = requestMeetings.filter((m) => m.status === "pending");
  const closedMeetings = requestMeetings.filter((m) => m.status === "closed");

  const handleRowClick = (meeting: AdminMeetingItem) => {
    setSelectedMeeting(meeting);
    setIsDialogOpen(true);
  };

  async function handleStatusChange() {
    if (!selectedMeeting || selectedMeeting.status !== "pending") return;

    setClosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/meetings/${selectedMeeting._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to close meeting");
        return;
      }
      setIsDialogOpen(false);
      setSelectedMeeting(null);
      await refetch();
    } catch {
      setError("Failed to close meeting");
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="relative -mx-4 -my-10 min-h-[calc(100vh-4rem)] bg-background px-4 py-10 sm:-mx-6 sm:px-6">
      <BGPattern variant="grid" mask="fade-edges" fill="#1a1a1a" size={32} />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-[-0.03em] text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage client requests, availability, and booked discovery calls
          </p>
        </div>

        {error || loadError ? (
          <p className="text-sm text-destructive" role="alert">
            {error ?? loadError}
          </p>
        ) : null}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="requests">Meeting Requests</TabsTrigger>
            <TabsTrigger value="availability">Time for Meeting</TabsTrigger>
            <TabsTrigger value="schedule">Booked Schedule</TabsTrigger>
            <TabsTrigger value="whom-to-send">Whom to Send</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMeetings.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedMeetings.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Completed or archived</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Meeting Requests</CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                Loading meetings...
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="w-[200px]">Client Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Project Summary</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestMeetings.length > 0 ? (
                      requestMeetings.map((meeting) => {
                        const zoned = toZonedTime(
                          new Date(meeting.startAt),
                          meeting.timezone,
                        );
                        return (
                          <TableRow
                            key={meeting._id}
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            onClick={() => handleRowClick(meeting)}
                          >
                            <TableCell className="font-mono text-sm">
                              <button
                                type="button"
                                className="flex items-center gap-2 text-primary hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(meeting);
                                }}
                              >
                                <Mail className="h-4 w-4" />
                                {meeting.email}
                              </button>
                            </TableCell>
                            <TableCell className="font-medium">{meeting.name}</TableCell>
                            <TableCell>
                              {format(zoned, "MMM d, yyyy · h:mm a")}
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {meeting.projectSummary}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                className={cn("capitalize", statusBadgeClass(meeting.status))}
                              >
                                {meeting.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {searchQuery
                            ? "No meeting requests match your search"
                            : "No meeting requests found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="availability">
            <AdminAvailabilitySettings />
          </TabsContent>

          <TabsContent value="schedule">
            <AdminScheduleView meetings={meetings} />
          </TabsContent>

          <TabsContent value="whom-to-send">
            <AdminWhomToSend />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meeting Request Details</DialogTitle>
            <DialogDescription>
              Review the complete information for this meeting request
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {selectedMeeting ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Client Name</span>
                  </div>
                  <p className="font-medium text-foreground">{selectedMeeting.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="font-mono text-sm text-foreground">
                    {selectedMeeting.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Meeting Date</span>
                  </div>
                  <p className="text-foreground">
                    {format(
                      toZonedTime(
                        new Date(selectedMeeting.startAt),
                        selectedMeeting.timezone,
                      ),
                      "EEEE, MMMM d, yyyy · h:mm a",
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge
                    className={cn(
                      "capitalize",
                      statusBadgeClass(selectedMeeting.status),
                    )}
                  >
                    {selectedMeeting.status}
                  </Badge>
                </div>
              </div>

              {selectedMeeting.company ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-foreground">{selectedMeeting.company}</p>
                </div>
              ) : null}

              {selectedMeeting.phone ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-mono text-foreground">{selectedMeeting.phone}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Project Summary
                </p>
                <p className="text-foreground">{selectedMeeting.projectSummary}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            {selectedMeeting?.status === "pending" ? (
              <Button onClick={handleStatusChange} disabled={closing}>
                {closing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Closing...
                  </>
                ) : (
                  "Mark as Closed"
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
