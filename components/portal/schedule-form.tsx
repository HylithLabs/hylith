"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";
import { formatDateLabel, formatSlotLabel } from "@/lib/availability";

export function ScheduleForm() {
  const router = useRouter();
  const [bookableDays, setBookableDays] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [projectSummary, setProjectSummary] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const bookableSet = new Set(bookableDays);

  const loadDays = useCallback(async () => {
    const res = await fetch("/api/availability");
    if (!res.ok) return;
    const data = await res.json();
    setBookableDays(data.bookableDays ?? []);
    setTimezone(data.timezone ?? "Asia/Kolkata");
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  useEffect(() => {
    if (!selectedDay) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    const dateKey = format(selectedDay, "yyyy-MM-dd");
    fetch(`/api/availability?date=${dateKey}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setSelectedSlot(null);
      });
  }, [selectedDay]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }
    if (projectSummary.trim().length < 10) {
      setError("Please describe your project (at least 10 characters)");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: selectedSlot,
        projectSummary: projectSummary.trim(),
        company: company.trim() || undefined,
        phone: phone.trim() || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not submit request");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  const selectedStart = selectedSlot ? new Date(selectedSlot) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <Card className="border-border bg-card shadow-[0_1px_1px_rgba(15,11,10,0.05),0_4px_16px_rgba(15,11,10,0.06)]">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-dm-sans)] text-xl tracking-[-0.02em]">
            Pick a date
          </CardTitle>
          <CardDescription>
            Times shown in {timezone.replace("_", " ")}. Mon–Fri, 10:00–18:00.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            disabled={(date) => {
              const key = format(date, "yyyy-MM-dd");
              return !bookableSet.has(key);
            }}
            className="rounded-lg border border-border bg-background p-2"
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg tracking-[-0.02em]">Available times</CardTitle>
            <CardDescription>
              {selectedDay
                ? format(selectedDay, "EEEE, MMMM d")
                : "Select a date first"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDay && slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots on this day.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((iso) => {
                  const d = parseISO(iso);
                  const label = formatSlotLabel(d, timezone);
                  const active = selectedSlot === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSelectedSlot(iso)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/40",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg tracking-[-0.02em]">Your project</CardTitle>
            {selectedStart ? (
              <CardDescription>
                {formatDateLabel(selectedStart, timezone)} at{" "}
                {formatSlotLabel(selectedStart, timezone)}
              </CardDescription>
            ) : (
              <CardDescription>Select a date and time to continue</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="company">Company (optional)</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background"
                />
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
              <Button
                type="submit"
                disabled={loading || !selectedSlot || success}
                className="h-11 w-full rounded-full font-semibold"
              >
                {loading ? "Submitting…" : "Confirm & request call"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
