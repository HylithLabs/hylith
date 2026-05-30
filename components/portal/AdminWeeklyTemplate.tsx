"use client";

import { useMemo, useState } from "react";
import { fromZonedTime } from "date-fns-tz";
import { addDays, format } from "date-fns";
import { AGENCY_TIMEZONE, SLOT_DURATION_MINUTES } from "@/lib/availability-constants";
import { todayDateKey } from "@/lib/availability-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface DayRule {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

const DEFAULT_RULES: DayRule[] = [
  { enabled: false, startHour: 9, endHour: 17 }, // Sun
  { enabled: true, startHour: 9, endHour: 17 },  // Mon
  { enabled: true, startHour: 9, endHour: 17 },  // Tue
  { enabled: true, startHour: 9, endHour: 17 },  // Wed
  { enabled: true, startHour: 9, endHour: 17 },  // Thu
  { enabled: true, startHour: 9, endHour: 17 },  // Fri
  { enabled: false, startHour: 9, endHour: 17 }, // Sat
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  const label = i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`;
  return { value: i, label };
});

function generateSlotsFromRules(rules: DayRule[], weeksAhead: number): string[] {
  const slots: string[] = [];
  const todayStr = todayDateKey(AGENCY_TIMEZONE);
  const today = new Date(`${todayStr}T00:00:00`);
  // Sunday of current week
  const weekStart = addDays(today, -today.getDay());

  for (let w = 0; w < weeksAhead; w++) {
    for (let d = 0; d < 7; d++) {
      const rule = rules[d as DayIndex];
      if (!rule.enabled) continue;

      const date = addDays(weekStart, w * 7 + d);
      const dateKey = format(date, "yyyy-MM-dd");

      if (dateKey < todayStr) continue;

      for (let hour = rule.startHour; hour < rule.endHour; hour++) {
        for (let min = 0; min < 60; min += SLOT_DURATION_MINUTES) {
          const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
          const iso = fromZonedTime(`${dateKey}T${timeStr}:00`, AGENCY_TIMEZONE).toISOString();
          slots.push(iso);
        }
      }
    }
  }

  return [...new Set(slots)].sort();
}

interface AdminWeeklyTemplateProps {
  onApply: (slots: string[]) => void;
}

export function AdminWeeklyTemplate({ onApply }: AdminWeeklyTemplateProps) {
  const [rules, setRules] = useState<DayRule[]>(DEFAULT_RULES);
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [applied, setApplied] = useState(false);

  const previewCount = useMemo(
    () => generateSlotsFromRules(rules, weeksAhead).length,
    [rules, weeksAhead],
  );

  function toggleDay(idx: DayIndex) {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, enabled: !r.enabled } : r)));
    setApplied(false);
  }

  function setHour(idx: DayIndex, field: "startHour" | "endHour", val: number) {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const next = { ...r, [field]: val };
        if (field === "startHour" && val >= r.endHour) next.endHour = val + 1;
        if (field === "endHour" && val <= r.startHour) next.startHour = val - 1;
        return next;
      }),
    );
    setApplied(false);
  }

  function handleApply() {
    const slots = generateSlotsFromRules(rules, weeksAhead);
    onApply(slots);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Weekly schedule template</CardTitle>
        <CardDescription>
          Set recurring hours per day. Click <strong>Apply template</strong> to add these slots to your draft — then save.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weeks selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Apply for next</span>
          <div className="flex gap-1">
            {[2, 4, 6, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeeksAhead(w)}
                className={cn(
                  "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
                  weeksAhead === w
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:bg-muted",
                )}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>

        {/* Day rules */}
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {DAYS.map((day, idx) => {
            const rule = rules[idx as DayIndex];
            return (
              <div
                key={day}
                className={cn(
                  "flex flex-wrap items-center gap-3 px-4 py-3 transition-colors",
                  rule.enabled ? "bg-background" : "bg-muted/30",
                )}
              >
                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={rule.enabled}
                  onClick={() => toggleDay(idx as DayIndex)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    rule.enabled ? "bg-foreground" : "bg-muted-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                      rule.enabled ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                </button>

                {/* Day label */}
                <span
                  className={cn(
                    "w-8 text-sm font-medium",
                    rule.enabled ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {day}
                </span>

                {/* Time selects */}
                {rule.enabled ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={rule.startHour}
                      onChange={(e) => setHour(idx as DayIndex, "startHour", Number(e.target.value))}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      {HOUR_OPTIONS.filter((o) => o.value < 23).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <span className="text-sm text-muted-foreground">–</span>
                    <select
                      value={rule.endHour}
                      onChange={(e) => setHour(idx as DayIndex, "endHour", Number(e.target.value))}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      {HOUR_OPTIONS.filter((o) => o.value > 0).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Apply button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleApply}
            disabled={!rules.some((r) => r.enabled)}
          >
            Apply template
          </Button>
          {previewCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {previewCount} slot{previewCount !== 1 ? "s" : ""} will be added to draft
            </span>
          )}
          {applied && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Template applied — review and save above
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
