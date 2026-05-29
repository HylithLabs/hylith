"use client";

import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ScheduleMeeting = {
  _id: string;
  email: string;
  name: string;
  startAt: string;
  timezone: string;
  status: "pending" | "confirmed" | "cancelled" | "closed";
};

export function AdminScheduleView({ meetings }: { meetings: ScheduleMeeting[] }) {
  const scheduleMeetings = meetings
    .filter((m) => m.status === "pending" || m.status === "confirmed")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Booked Schedule</CardTitle>
        <CardDescription>
          All active bookings — if a slot is taken here, no other client can book it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead>Time</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleMeetings.length > 0 ? (
                scheduleMeetings.map((meeting) => {
                  const zoned = toZonedTime(new Date(meeting.startAt), meeting.timezone);
                  return (
                    <TableRow key={meeting._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {format(zoned, "MMM d, yyyy · h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{meeting.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{meeting.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize",
                            meeting.status === "confirmed"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          )}
                        >
                          {meeting.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No upcoming meetings scheduled
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
