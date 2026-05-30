"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import {
  AppointmentScheduler,
  type TimeSlot,
} from "@/components/ui/appointment-scheduler";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Check,
  AlertCircle,
  Globe,
  Trash2,
  Calendar,
} from "lucide-react";
import { AGENCY_TIMEZONE } from "@/lib/availability-constants";
import {
  generateCandidateSlotsForDay,
  getFutureDateKeys,
  isSlotInPast,
} from "@/lib/availability-client";
import {
  formatDateLabel,
  formatSlotDateKey,
  formatSlotLabel,
  formatSlotTimeKey,
  todayDateKey,
} from "@/lib/availability-utils";
import { cn } from "@/lib/utils";
import { useAdminAvailabilitySettings } from "@/lib/hooks/use-admin-availability-settings";
import { queryKeys } from "@/lib/query/keys";

function sameSlot(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60_000;
}

export function AdminAvailabilitySettings() {
  const queryClient = useQueryClient();
  const {
    data: settings,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useAdminAvailabilitySettings();
  const savedSlots = settings?.availableSlots ?? [];

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  /** Unsaved picks in the scheduler */
  const [draftSlots, setDraftSlots] = useState<string[]>([]);
  const [draftDirty, setDraftDirty] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  /** Re-evaluate past slots as the clock moves (e.g. 1pm becomes disabled after 2pm). */
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const futureDateKeys = useMemo(() => getFutureDateKeys(60), []);

  const datesWithSavedAvailability = useMemo(() => {
    const keys = new Set(savedSlots.map((iso) => formatSlotDateKey(iso)));
    return Array.from(keys).sort();
  }, [savedSlots]);

  useEffect(() => {
    if (!settings || draftDirty) return;
    setDraftSlots(settings.availableSlots);
  }, [settings, draftDirty]);

  useEffect(() => {
    if (queryError) {
      setError("Failed to load availability");
    }
  }, [queryError]);

  useEffect(() => {
    if (!loading && !selectedDateKey) {
      setSelectedDateKey(todayDateKey());
    }
  }, [loading, selectedDateKey]);

  const slotByTime = useMemo(() => {
    if (!selectedDateKey) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const iso of generateCandidateSlotsForDay(selectedDateKey)) {
      map.set(formatSlotTimeKey(iso), iso);
    }
    return map;
  }, [selectedDateKey]);

  const selectedTimesForDay = useMemo(() => {
    if (!selectedDateKey) return [];
    const now = new Date(nowMs);
    const times: string[] = [];
    for (const iso of draftSlots) {
      if (formatSlotDateKey(iso) !== selectedDateKey) continue;
      if (isSlotInPast(iso, now)) continue;
      const time = formatSlotTimeKey(iso);
      if (slotByTime.has(time)) times.push(time);
    }
    return times;
  }, [draftSlots, selectedDateKey, slotByTime, nowMs]);

  const timeSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDateKey) return [];
    const now = new Date(nowMs);
    return Array.from(slotByTime.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, iso]) => ({
        time,
        available: !isSlotInPast(iso, now),
      }));
  }, [selectedDateKey, slotByTime, nowMs]);

  const hasUnsavedChanges = useMemo(() => {
    if (draftSlots.length !== savedSlots.length) return true;
    const savedSet = new Set(savedSlots);
    return draftSlots.some((s) => !savedSet.has(s));
  }, [draftSlots, savedSlots]);

  const groupedSavedSlots = useMemo(() => {
    const sorted = [...savedSlots].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    const groups = new Map<string, string[]>();
    for (const iso of sorted) {
      const key = formatSlotDateKey(iso);
      const list = groups.get(key) ?? [];
      list.push(iso);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [savedSlots]);

  function handleTimeToggle(time: string) {
    const iso = slotByTime.get(time);
    if (!iso || isSlotInPast(iso)) return;

    setDraftDirty(true);
    setDraftSlots((prev) => {
      const exists = prev.some((s) => sameSlot(s, iso));
      if (exists) return prev.filter((s) => !sameSlot(s, iso));
      return [...prev, iso].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
    });
  }

  function openAllTimesForSelectedDay() {
    if (!selectedDateKey) return;
    const now = new Date();
    const candidates = generateCandidateSlotsForDay(selectedDateKey).filter(
      (iso) => !isSlotInPast(iso, now),
    );
    setDraftDirty(true);
    setDraftSlots((prev) => {
      const merged = [...prev];
      for (const iso of candidates) {
        if (!merged.some((s) => sameSlot(s, iso))) merged.push(iso);
      }
      return merged.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    });
  }

  function closeAllTimesForSelectedDay() {
    if (!selectedDateKey) return;
    setDraftDirty(true);
    setDraftSlots((prev) =>
      prev.filter((s) => formatSlotDateKey(s) !== selectedDateKey),
    );
  }

  async function persistSlots(slots: string[]) {
    const futureSlots = slots.filter((iso) => !isSlotInPast(iso));
    const res = await fetch("/api/admin/availability-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availableSlots: futureSlots }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to save availability");
    }
    const data = await res.json();
    const saved: string[] = data.settings?.availableSlots;
    if (!Array.isArray(saved)) {
      throw new Error("Server returned invalid availability data");
    }
    return saved;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const saved = await persistSlots(draftSlots);
      setDraftSlots(saved);
      setDraftDirty(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.availabilitySettings,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.availability });
      await refetch();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSaving(false);
    }
  }

  async function removeSavedSlot(iso: string) {
    setSaving(true);
    setError(null);
    try {
      const next = savedSlots.filter((s) => !sameSlot(s, iso));
      const saved = await persistSlots(next);
      setDraftSlots(saved);
      setDraftDirty(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.availabilitySettings,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.availability });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove slot");
    } finally {
      setSaving(false);
    }
  }

  async function clearSavedDay(dateKey: string) {
    setSaving(true);
    setError(null);
    try {
      const next = savedSlots.filter((s) => formatSlotDateKey(s) !== dateKey);
      const saved = await persistSlots(next);
      setDraftSlots(saved);
      setDraftDirty(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.availabilitySettings,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.availability });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear day");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Time for Meeting</CardTitle>
          <CardDescription>
            Pick a date, toggle times on the clock (full day 12:00 AM – 11:30 PM
            Asia/Dhaka), then click <strong>Save availability</strong>. Clients only
            see saved slots. Green dates = already saved.
          </CardDescription>
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            <Globe className="size-4 shrink-0" />
            <span>
              Timezone: <strong className="text-foreground">Asia/Dhaka</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedDateKey ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAllTimesForSelectedDay}
              >
                Open all times this day
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeAllTimesForSelectedDay}
              >
                Clear this day (draft)
              </Button>
            </div>
          ) : null}

          <AppointmentScheduler
            userName="Hylith Admin"
            meetingTitle="Set availability"
            meetingType="Discovery call slots"
            duration="30 minutes"
            timezone={AGENCY_TIMEZONE}
            bookableDateKeys={futureDateKeys}
            highlightedDateKeys={datesWithSavedAvailability}
            timeSlots={timeSlots}
            multiSelect
            selectedTimes={selectedTimesForDay}
            initialSelectedDateKey={selectedDateKey ?? undefined}
            onDateSelect={setSelectedDateKey}
            onTimeToggle={handleTimeToggle}
            brandName="Hylith"
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving || (!hasUnsavedChanges && draftSlots.length === 0)}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save availability"
              )}
            </Button>
            {success ? (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <Check className="size-4" />
                Saved — clients can now book these times
              </div>
            ) : null}
            {error ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {error}
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {draftSlots.length} in draft
              {hasUnsavedChanges ? " · unsaved" : ""}
              {savedSlots.length > 0
                ? ` · ${savedSlots.length} saved for clients`
                : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your available times</CardTitle>
          <CardDescription>
            Only appears after you click Save availability. These are the exact
            dates and hours clients can book.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupedSavedSlots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing saved yet. Select times above and click Save availability.
            </p>
          ) : (
            <div className="space-y-4">
              {groupedSavedSlots.map(([dateKey, slots]) => {
                const dayDate = parseISO(`${dateKey}T12:00:00`);
                return (
                  <div
                    key={dateKey}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {formatDateLabel(dayDate, AGENCY_TIMEZONE)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {slots.length} slot{slots.length === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => clearSavedDay(dateKey)}
                        disabled={saving}
                      >
                        Clear day
                      </Button>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {slots.map((iso) => (
                        <li key={iso}>
                          <button
                            type="button"
                            onClick={() => removeSavedSlot(iso)}
                            disabled={saving}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-900 dark:text-green-100",
                              "transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive",
                            )}
                          >
                            <span>
                              {formatSlotLabel(new Date(iso), AGENCY_TIMEZONE)}
                            </span>
                            <Trash2 className="size-3.5 opacity-60" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
