"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Globe, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  /** yyyy-MM-dd keys — preferred for real booking data */
  bookableDateKeys?: string[];
  /** Legacy: day-of-month only (current visible month) */
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
  /** Dates (yyyy-MM-dd) that have at least one open slot — shown green on the calendar */
  highlightedDateKeys?: string[];
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
}: AppointmentSchedulerProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    initialSelectedDateKey ?? null,
  );
  const [selectedTime, setSelectedTime] = useState(initialSelectedTime ?? "");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [prevInitialDateKey, setPrevInitialDateKey] = useState(
    initialSelectedDateKey,
  );

  if (initialSelectedDateKey !== prevInitialDateKey) {
    setPrevInitialDateKey(initialSelectedDateKey);
    setSelectedDateKey(initialSelectedDateKey ?? null);
  }

  useEffect(() => {
    onMonthChange?.(currentMonth, currentYear);
  }, [currentMonth, currentYear, onMonthChange]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const bookableSet = useMemo(
    () => new Set(bookableDateKeys ?? []),
    [bookableDateKeys],
  );

  const highlightedSet = useMemo(
    () => new Set(highlightedDateKeys),
    [highlightedDateKeys],
  );

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const isDayAvailable = (day: number) => {
    const key = toDateKey(currentYear, currentMonth, day);
    if (bookableDateKeys?.length) {
      return bookableSet.has(key);
    }
    return availableDates.some((d) => d.date === day && d.hasSlots);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    if (!isDayAvailable(day)) return;
    const key = toDateKey(currentYear, currentMonth, day);
    setSelectedDateKey(key);
    onDateSelect?.(key);
  };

  const handleTimeClick = (time: string) => {
    if (multiSelect) {
      onTimeToggle?.(time);
      return;
    }
    setSelectedTime(time);
    onTimeSelect?.(time);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedParts = selectedDateKey?.split("-").map(Number);
  const selectedDate =
    selectedParts?.length === 3
      ? new Date(selectedParts[0], selectedParts[1] - 1, selectedParts[2])
      : null;

  const getSelectedDayName = () => {
    if (!selectedDate) return "—";
    return selectedDate.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getSelectedDateFormatted = () => {
    if (!selectedDate) return "Pick a date";
    return selectedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (timeFormat === "24h") return time;
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_1px_rgba(15,11,10,0.05),0_8px_24px_rgba(15,11,10,0.08)] lg:flex-row">
      <div className="w-full space-y-6 border-b border-border bg-card p-6 lg:w-80 lg:border-r lg:border-b-0">
        <div className="animate-fade-in flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={userAvatar ?? "/assets/logo.svg"}
              alt={userName}
            />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{userName}</span>
        </div>

        <div className="animate-fade-in animate-delay-100 space-y-4">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {meetingTitle}
          </h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 shrink-0" />
              <span>{meetingType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0" />
              <button
                type="button"
                className="flex items-center gap-1 transition-colors hover:text-foreground"
                onClick={() => onTimezoneChange?.(timezone)}
              >
                <span>{timezone.replace(/_/g, " ")}</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">
        <div className="space-y-4">
          <div className="animate-fade-in flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">
              {monthNames[currentMonth]}{" "}
              <span className="text-muted-foreground">{currentYear}</span>
            </h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const dateKey = toDateKey(currentYear, currentMonth, day);
              const available = isDayAvailable(day);
              const isSelected = selectedDateKey === dateKey;
              const hasOpenSlots = highlightedSet.has(dateKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={!available}
                  className={cn(
                    "animate-fade-in relative h-12 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    isSelected &&
                      "scale-105 bg-primary text-primary-foreground shadow-lg",
                    !isSelected &&
                      available &&
                      hasOpenSlots &&
                      "border border-green-500/50 bg-green-500/25 text-green-900 hover:bg-green-500/35 dark:text-green-100",
                    !isSelected &&
                      available &&
                      !hasOpenSlots &&
                      "bg-secondary/50 text-foreground hover:bg-secondary",
                    !available &&
                      "cursor-not-allowed text-muted-foreground/40",
                  )}
                  style={{ animationDelay: `${index * 10}ms` }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col border-t border-border bg-card p-6 lg:w-72 lg:border-t-0 lg:border-l">
        <div className="animate-fade-in mb-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-foreground">
              {getSelectedDayName()}
            </span>
            <span className="text-muted-foreground">
              , {getSelectedDateFormatted()}
            </span>
          </div>
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setTimeFormat("12h")}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                timeFormat === "12h"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              12h
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat("24h")}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                timeFormat === "24h"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              24h
            </button>
          </div>
        </div>

        <div className="scrollbar-thin max-h-[min(70vh,560px)] space-y-2 overflow-y-auto pr-2">
          {timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Select an available date to see times.
            </p>
          ) : (
            timeSlots.map((slot, index) => {
              const isSelected = multiSelect
                ? selectedTimes.includes(slot.time)
                : slot.time === selectedTime;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleTimeClick(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    "animate-fade-in w-full rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isSelected &&
                      "scale-[1.02] bg-primary text-primary-foreground shadow-lg",
                    !isSelected &&
                      slot.available &&
                      "bg-secondary/50 text-foreground hover:bg-secondary",
                    !slot.available &&
                      "cursor-not-allowed text-muted-foreground/40",
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {formatTime(slot.time)}
                </button>
              );
            })
          )}
        </div>

        <div className="animate-fade-in animate-delay-300 mt-4 border-t border-border pt-4">
          <p className="text-right text-xs text-muted-foreground">
            powered by {brandName}
          </p>
        </div>
      </div>
    </div>
  );
}
