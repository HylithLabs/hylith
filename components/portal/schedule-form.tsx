"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import {
  AppointmentScheduler,
  type TimeSlot,
} from "@/components/ui/appointment-scheduler";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatDateLabel,
  formatSlotLabel,
  formatSlotTimeKey,
} from "@/lib/availability-utils";

export function ScheduleForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [bookableDays, setBookableDays] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [projectSummary, setProjectSummary] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadDays = useCallback(async () => {
    try {
      const res = await fetch("/api/availability");
      if (!res.ok) {
        setError("Failed to load available dates");
        return;
      }
      const data = await res.json();
      setBookableDays(data.bookableDays ?? []);
      setTimezone(data.timezone ?? "Asia/Dhaka");
    } catch (err) {
      setError("Error loading availability. Please refresh the page.");
      console.error("Load days error:", err);
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  useEffect(() => {
    if (!selectedDateKey) {
      setSlots([]);
      setSelectedTime("");
      setSelectedSlotIso(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/availability?date=${selectedDateKey}`);
        if (!res.ok) {
          setError("Failed to load time slots");
          return;
        }
        const data = await res.json();
        setSlots(data.slots ?? []);
        setSelectedTime("");
        setSelectedSlotIso(null);
      } catch (err) {
        setError("Error loading time slots. Please try again.");
        console.error("Fetch slots error:", err);
      }
    })();
  }, [selectedDateKey]);

  const timeSlots: TimeSlot[] = useMemo(
    () =>
      slots.map((iso) => {
        try {
          return {
            time: formatSlotTimeKey(iso),
            available: true,
          };
        } catch (err) {
          console.error("Error parsing time slot:", iso, err);
          return {
            time: "--:--",
            available: false,
          };
        }
      }),
    [slots],
  );

  const slotByTime = useMemo(() => {
    const map = new Map<string, string>();
    for (const iso of slots) {
      try {
        map.set(formatSlotTimeKey(iso), iso);
      } catch (err) {
        console.error("Error mapping time slot:", iso, err);
      }
    }
    return map;
  }, [slots]);

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setSelectedSlotIso(slotByTime.get(time) ?? null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlotIso) {
      setError("Please select a time slot");
      return;
    }
    if (projectSummary.trim().length < 10) {
      setError("Please describe your project (at least 10 characters)");
      return;
    }
    if (!company.trim()) {
      setError("Company is required");
      return;
    }
    if (phone.trim().length < 5) {
      setError("Please enter a valid phone number (at least 5 characters)");
      return;
    }

    setError(null);
    setEmailWarning(null);
    setLoading(true);

    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: selectedSlotIso,
        projectSummary: projectSummary.trim(),
        company: company.trim(),
        phone: phone.trim(),
      }),
    });

    let data: { error?: string; emailsSent?: boolean } = {};
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error("Error parsing response:", parseErr);
    }
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not submit request");
      return;
    }

    setSuccess(true);
    if (data.emailsSent === false) {
      setEmailWarning(
        "Request saved. Confirmation email could not be sent — we still received your booking.",
      );
    }
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  const selectedStart = selectedSlotIso ? new Date(selectedSlotIso) : null;
  const userName = session?.user?.name ?? "Hylith Team";

  return (
    <div className="space-y-8">
      <AppointmentScheduler
        userName={userName}
        meetingTitle="Discovery call"
        meetingType="Video call"
        duration="30 minutes"
        timezone={timezone}
        bookableDateKeys={bookableDays}
        timeSlots={timeSlots}
        onDateSelect={setSelectedDateKey}
        onTimeSelect={handleTimeSelect}
        brandName="Hylith"
        initialSelectedTime={selectedTime}
      />

      <Card className="mx-auto w-full max-w-5xl border-border bg-card">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-dm-sans)] text-lg tracking-[-0.02em]">
            Your project
          </CardTitle>
          {selectedStart ? (
            <CardDescription>
              {formatDateLabel(selectedStart, timezone)} at{" "}
              {formatSlotLabel(selectedStart, timezone)}
            </CardDescription>
          ) : (
            <CardDescription>
              Select a date and time above, then tell us what you are building.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">What are you building?</Label>
              <Textarea
                id="summary"
                required
                rows={4}
                value={projectSummary}
                onChange={(e) => setProjectSummary(e.target.value)}
                placeholder="Brief overview of your product, goals, and timeline…"
                className="resize-none bg-background"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  minLength={5}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-foreground" role="status">
                Request sent. Redirecting to dashboard…
              </p>
            ) : null}
            {emailWarning ? (
              <p className="text-sm text-muted-foreground" role="status">
                {emailWarning}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={loading || !selectedSlotIso || success}
              className="h-11 rounded-full px-8 font-semibold"
            >
              {loading ? "Submitting…" : "Confirm & request call"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
