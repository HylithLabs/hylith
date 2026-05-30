"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, Globe, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableDate {
  date: number;
  hasSlots: boolean;
}

export interface AppointmentSchedulerProps {
  userName: string;
  userAvatar?: string;
  meetingTitle: string;
  meetingType: string;
  duration: string;
  timezone: string;
  bookableDateKeys?: string[];
  availableDates?: AvailableDate[];
  timeSlots: TimeSlot[];
  onDateSelect?: (dateKey: string) => void;
  onTimeSelect?: (time: string) => void;
  onTimeToggle?: (time: string) => void;
  onTimezoneChange?: (timezone: string) => void;
  onMonthChange?: (month: number, year: number) => void;
  brandName?: string;
  initialSelectedDateKey?: string;
  initialSelectedTime?: string;
  multiSelect?: boolean;
  selectedTimes?: string[];
  highlightedDateKeys?: string[];
  /** When provided, the right panel shows this form instead of time slots */
  formContent?: React.ReactNode;
  onBack?: () => void;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AppointmentScheduler({
  userName,
  userAvatar,
  meetingTitle,
  meetingType,
  duration,
  timezone,
  bookableDateKeys,
  availableDates = [],
  timeSlots,
  onDateSelect,
  onTimeSelect,
  onTimezoneChange,
  onMonthChange,
  brandName = "Hylith",
  initialSelectedDateKey,
  initialSelectedTime,
  multiSelect = false,
  selectedTimes = [],
  onTimeToggle,
  highlightedDateKeys = [],
  formContent,
}: AppointmentSchedulerProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    initialSelectedDateKey ?? null,
  );
  const [selectedTime, setSelectedTime] = useState(initialSelectedTime ?? "");
  const [tentativeTime, setTentativeTime] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [prevInitialDateKey, setPrevInitialDateKey] = useState(initialSelectedDateKey);
  const [prevInitialTime, setPrevInitialTime] = useState(initialSelectedTime);

  if (initialSelectedDateKey !== prevInitialDateKey) {
    setPrevInitialDateKey(initialSelectedDateKey);
    setSelectedDateKey(initialSelectedDateKey ?? null);
  }

  if (initialSelectedTime !== prevInitialTime) {
    setPrevInitialTime(initialSelectedTime);
    setSelectedTime(initialSelectedTime ?? "");
  }

  useEffect(() => {
    onMonthChange?.(currentMonth, currentYear);
  }, [currentMonth, currentYear, onMonthChange]);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const bookableSet = useMemo(() => new Set(bookableDateKeys ?? []), [bookableDateKeys]);
  const highlightedSet = useMemo(() => new Set(highlightedDateKeys), [highlightedDateKeys]);
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const isDayAvailable = (day: number) => {
    const key = toDateKey(currentYear, currentMonth, day);
    if (bookableDateKeys?.length) return bookableSet.has(key);
    return availableDates.some((d) => d.date === day && d.hasSlots);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const handleDateClick = (day: number) => {
    if (!isDayAvailable(day)) return;
    const key = toDateKey(currentYear, currentMonth, day);
    setSelectedDateKey(key);
    setTentativeTime(null);
    setSelectedTime("");
    onDateSelect?.(key);
  };

  const handleTimeClick = (time: string) => {
    if (multiSelect) { onTimeToggle?.(time); return; }
    if (tentativeTime === time) {
      setSelectedTime(time);
      setTentativeTime(null);
      onTimeSelect?.(time);
    } else {
      setTentativeTime(time);
    }
  };

  const handleConfirmTime = (time: string) => {
    setSelectedTime(time);
    setTentativeTime(null);
    onTimeSelect?.(time);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDay(currentMonth, currentYear);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const formatTime = (time: string) => {
    if (timeFormat === "24h") return time;
    const [h, m] = time.split(":");
    const hour = Number(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  // Selected date label for slot panel header
  const selectedDayLabel = selectedDateKey
    ? new Date(
        Number(selectedDateKey.split("-")[0]),
        Number(selectedDateKey.split("-")[1]) - 1,
        Number(selectedDateKey.split("-")[2]),
      ).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : null;

  return (
    <div className="mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm lg:max-w-6xl lg:flex-row">

      {/* ── Left sidebar ─────────────────────────────────────────── */}
      <div className="w-full shrink-0 border-b border-border p-6 lg:w-[280px] lg:border-r lg:border-b-0">
        {/* User avatar + name */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-full ring-1 ring-border">
            <AvatarImage src={userAvatar ?? "/assets/logo.svg"} alt={userName} />
            <AvatarFallback className="text-sm">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{userName}</span>
        </div>

        {/* Meeting title */}
        <h2 className="mt-4 text-xl font-semibold leading-none tracking-tight text-foreground">
          {meetingTitle}
        </h2>

        {/* Meta rows */}
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4 shrink-0" />
            <span>{meetingType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 shrink-0" />
            <button
              type="button"
              onClick={() => onTimezoneChange?.(timezone)}
              className="text-left transition-colors hover:text-foreground"
            >
              {timezone.replace(/_/g, " ")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Calendar ─────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 border-b border-border p-5 lg:border-r lg:border-b-0">
        {/* Month nav */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold leading-none text-foreground">
            {monthNames[currentMonth]}{" "}
            <span className="font-normal text-muted-foreground">{currentYear}</span>
          </h3>
          <div className="flex gap-0.5">
            {[
              { handler: handlePrevMonth, icon: <ChevronLeft className="h-4 w-4" /> },
              { handler: handleNextMonth, icon: <ChevronRight className="h-4 w-4" /> },
            ].map(({ handler, icon }, i) => (
              <button
                key={i}
                type="button"
                onClick={handler}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="mb-1 grid grid-cols-7">
          {dayNames.map((d, i) => (
            <div key={i} className="py-1.5 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} className="relative pb-[100%]" />;

            const dateKey = toDateKey(currentYear, currentMonth, day);
            const available = isDayAvailable(day);
            const isSelected = selectedDateKey === dateKey;
            const isHighlighted = highlightedSet.has(dateKey);
            const isToday = dateKey === todayKey;

            return (
              <div key={dateKey} className="relative pb-[100%]">
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={!available}
                  className={cn(
                    "absolute inset-0.5 flex flex-col items-center justify-center rounded-md border-2 border-transparent text-sm font-medium transition",
                    // selected
                    isSelected && "bg-foreground text-background",
                    // available + has saved slots (admin view)
                    !isSelected && available && isHighlighted &&
                      "bg-green-50 text-green-900 hover:border-green-600 dark:bg-green-900/20 dark:text-green-100",
                    // available
                    !isSelected && available && !isHighlighted &&
                      "bg-muted text-foreground hover:border-foreground",
                    // disabled
                    !available && "cursor-default font-light text-muted-foreground/30",
                  )}
                >
                  {day}
                  {isToday && (
                    <span
                      className={cn(
                        "mt-0.5 h-[5px] w-[5px] rounded-full",
                        isSelected ? "bg-background" : "bg-foreground",
                      )}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {selectedDateKey && selectedTime && (
          <div className="mt-5 overflow-hidden rounded-xl border border-border text-sm">
            <div className="grid grid-cols-[88px_1fr] border-b border-border">
              <div className="bg-muted/50 px-3 py-2 font-medium text-muted-foreground">
                Date
              </div>
              <div className="px-3 py-2 font-medium text-foreground">
                {selectedDayLabel}
              </div>
            </div>
            <div className="grid grid-cols-[88px_1fr]">
              <div className="bg-muted/50 px-3 py-2 font-medium text-muted-foreground">
                Time
              </div>
              <div className="px-3 py-2 font-medium text-foreground">
                {formatTime(selectedTime)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right panel: form or timeslots ───────────────────────── */}
      {formContent ? (
        /* Form mode */
        <div className="flex w-full min-w-0 flex-col p-8 [&_input]:box-border [&_input]:min-w-0 [&_input]:max-w-full [&_input]:truncate lg:w-[480px]">
          {formContent}
        </div>
      ) : (
        /* Timeslot mode */
        <div className="w-full min-w-0 overflow-hidden p-5 lg:w-[320px]">
          {/* Header row */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium leading-none text-foreground">
              {selectedDayLabel ?? "Select a date"}
            </span>
            {/* 12h / 24h toggle */}
            <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
              {(["12h", "24h"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setTimeFormat(fmt)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium leading-none transition-colors",
                    timeFormat === fmt
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="max-h-[min(66vh,520px)] space-y-2 overflow-y-auto">
            {timeSlots.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">
                {selectedDateKey ? "No times available." : "Select a date to see times."}
              </p>
            ) : (
              timeSlots.map((slot) => {
                const isMultiSel = multiSelect && selectedTimes.includes(slot.time);
                const isTentative = !multiSelect && tentativeTime === slot.time;
                const isConfirmed = !multiSelect && selectedTime === slot.time && !tentativeTime;

                return (
                  <div key={slot.time} className="flex w-full min-w-0 gap-2">
                    {/* Time button — Cal secondary style */}
                    <button
                      type="button"
                      onClick={() => slot.available && handleTimeClick(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        "min-h-[36px] min-w-0 flex-1 rounded-[10px] border px-4 py-2 text-sm font-medium leading-none transition",
                        // rested shadow
                        "shadow-[0px_2px_3px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]",
                        // available default
                        slot.available && !isTentative && !isConfirmed && !isMultiSel &&
                          "border-border bg-background text-foreground hover:bg-muted hover:shadow-[0px_2px_3px_rgba(0,0,0,0.05),0px_2px_2px_-1px_rgba(0,0,0,0.05)]",
                        // tentative (first click)
                        isTentative && "border-foreground bg-background text-foreground",
                        // confirmed
                        isConfirmed && "border-foreground bg-foreground text-background",
                        // multi-selected
                        isMultiSel && "border-foreground bg-foreground text-background",
                        // disabled
                        !slot.available && "cursor-default border-border text-muted-foreground/30 shadow-none",
                      )}
                    >
                      {formatTime(slot.time)}
                    </button>

                    {/* Confirm button — Cal primary style, animated */}
                    <AnimatePresence>
                      {isTentative && !multiSelect && (
                        <motion.div
                          key="confirm"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="shrink-0 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => handleConfirmTime(slot.time)}
                            className={cn(
                              "h-full min-h-[36px] whitespace-nowrap rounded-[10px] border border-transparent",
                              "bg-foreground px-4 text-sm font-medium leading-none text-background",
                              "shadow-[0px_2px_3px_rgba(0,0,0,0.06),0px_1px_1px_rgba(0,0,0,0.08),1px_4px_8px_rgba(0,0,0,0.12),0px_2px_0.4px_rgba(255,255,255,0.12)_inset,0px_-3px_2px_rgba(0,0,0,0.04)_inset]",
                              "transition-opacity hover:opacity-90",
                            )}
                          >
                            Confirm
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-right text-[11px] text-muted-foreground/50">
              powered by {brandName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
