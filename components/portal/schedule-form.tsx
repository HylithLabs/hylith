"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import { Calendar, Check, ChevronDown, Loader2, Plus, X } from "lucide-react";
import {
  AppointmentScheduler,
  type TimeSlot,
} from "@/components/ui/appointment-scheduler";
import { MIN_LEAD_HOURS } from "@/lib/availability-constants";
import {
  formatDateLabel,
  formatSlotLabel,
  formatSlotTimeKey,
} from "@/lib/availability-utils";
import { useBookableDays, useSlotsForDay } from "@/lib/hooks/use-availability";
import { cn } from "@/lib/utils";

// ── Options ─────────────────────────────────────────────────────────────────

const SERVICES = [
  "UI/UX Design",
  "Web Development",
  "Mobile App",
  "Brand Identity",
  "Full-Stack",
  "Consulting",
] as const;

const BUDGETS = [
  "Less than $5k",
  "$5k – $15k",
  "$15k – $50k",
  "$50k – $100k",
  "$100k+",
  "Not sure yet",
];

const PROJECT_STATUSES = [
  "Just an idea",
  "Have wireframes / mockups",
  "Design is ready",
  "In active development",
  "Already launched",
];

// ── Design tokens (matching Cal.com exactly) ─────────────────────────────────

/** Cal's input base — rounded-[10px], h-8, rested shadow, emphasis on focus */
const calInput = cn(
  "w-full rounded-[10px] border border-border bg-background",
  "h-8 px-3 text-sm text-foreground leading-none",
  "placeholder:text-muted-foreground/60",
  "shadow-[0px_2px_3px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]",
  "hover:border-foreground/40",
  "focus:border-foreground/50 focus:outline-none focus:ring-0",
  "focus:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.20),0px_0px_0px_2px_rgba(0,0,0,0.10)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "transition-[border-color,box-shadow]",
);

/** Cal's select — same as input but appearance-none + taller for select content */
const calSelect = cn(
  "w-full cursor-pointer appearance-none rounded-[10px] border border-border bg-background",
  "h-8 px-3 pr-8 text-sm text-foreground leading-none",
  "shadow-[0px_2px_3px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]",
  "hover:border-foreground/40",
  "focus:border-foreground/50 focus:outline-none focus:ring-0",
  "focus:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.20),0px_0px_0px_2px_rgba(0,0,0,0.10)]",
  "transition-[border-color,box-shadow]",
);

/** Cal's textarea */
const calTextarea = cn(
  "w-full rounded-[10px] border border-border bg-background",
  "px-3 py-2 text-sm text-foreground leading-normal",
  "placeholder:text-muted-foreground/60",
  "shadow-[0px_2px_3px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]",
  "hover:border-foreground/40",
  "focus:border-foreground/50 focus:outline-none focus:ring-0",
  "focus:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.20),0px_0px_0px_2px_rgba(0,0,0,0.10)]",
  "resize-none transition-[border-color,box-shadow]",
);

/** Cal label: mb-2 block text-sm font-medium leading-none text-emphasis */
const calLabel = "mb-2 block text-sm font-medium leading-none text-foreground";

/** Cal primary button */
const calPrimaryBtn = cn(
  "inline-flex items-center justify-center gap-1",
  "rounded-[10px] border border-transparent bg-foreground",
  "px-3 py-2 text-sm font-medium leading-none text-background",
  "shadow-[0px_2px_3px_rgba(0,0,0,0.06),0px_1px_1px_rgba(0,0,0,0.08),1px_4px_8px_rgba(0,0,0,0.12),0px_2px_0.4px_rgba(255,255,255,0.12)_inset,0px_-3px_2px_rgba(0,0,0,0.04)_inset]",
  "hover:shadow-[0px_1px_1px_rgba(0,0,0,0.10),0px_2px_3px_rgba(0,0,0,0.08),1px_4px_8px_rgba(0,0,0,0.12),0px_-3px_2px_rgba(0,0,0,0.10)_inset,0px_2px_0.4px_rgba(255,255,255,0.24)_inset]",
  "active:shadow-[0px_3px_1px_rgba(0,0,0,0.10)_inset,0px_0px_2px_rgba(0,0,0,0.10)_inset]",
  "disabled:opacity-30 disabled:cursor-not-allowed",
  "transition-shadow duration-100",
  "whitespace-nowrap cursor-pointer",
);

/** Cal minimal/back button */
const calMinimalBtn = cn(
  "inline-flex items-center justify-center gap-1",
  "rounded-[10px] border border-transparent",
  "px-3 py-2 text-sm font-medium leading-none text-muted-foreground",
  "hover:bg-muted hover:text-foreground hover:border-border",
  "transition-[background,border-color,color] duration-200",
  "cursor-pointer",
);

/** Cal secondary chip (service toggles) */
function calChip(selected: boolean) {
  return cn(
    "rounded-[10px] border px-2.5 py-1.5 text-sm font-medium leading-none transition",
    "shadow-[0px_2px_3px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]",
    selected
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-foreground hover:bg-muted",
    "cursor-pointer",
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={calLabel}>
        {label}
        {required && <span className="ml-0.5 text-red-500 font-normal">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Booking form panel ────────────────────────────────────────────────────────

function BookingFormPanel({
  selectedSlotIso,
  timezone,
  prefillName,
  prefillEmail,
  onBack,
  onSuccess,
}: {
  selectedSlotIso: string;
  timezone: string;
  prefillName: string;
  prefillEmail: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [company, setCompany] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [guests, setGuests] = useState<string[]>([]);
  const [guestInput, setGuestInput] = useState("");
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStart = new Date(selectedSlotIso);

  function toggleService(s: string) {
    setServices((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }

  function addGuest() {
    const g = guestInput.trim();
    if (!g || !g.includes("@") || guests.includes(g)) return;
    setGuests((p) => [...p, g]);
    setGuestInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (!company.trim()) { setError("Company name is required"); return; }
    if (!companyUrl.trim()) { setError("Company URL is required"); return; }
    if (services.length === 0) { setError("Select at least one service"); return; }
    if (!budget) { setError("Budget is required"); return; }
    if (!projectStatus) { setError("Project status is required"); return; }
    if (!deadline.trim()) { setError("Deadline is required"); return; }
    if (description.trim().length < 10) { setError("Project description is too short"); return; }

    setError(null);
    setLoading(true);

    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: selectedSlotIso,
        name: name.trim(),
        company: company.trim(),
        companyUrl: companyUrl.trim(),
        services,
        budget,
        projectStatus,
        deadline: deadline.trim(),
        projectDescription: description.trim(),
        guests,
      }),
    });

    let data: { error?: string } = {};
    try { data = await res.json(); } catch {}
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Could not submit. Please try again."); return; }
    onSuccess();
  }

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">

      {/* Selected time chip */}
      <div className="mb-4 flex items-center gap-1.5 text-sm">
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">
          {formatDateLabel(selectedStart, timezone)}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-medium text-foreground">
          {formatSlotLabel(selectedStart, timezone)}
        </span>
      </div>

      {/* ── Scrollable fields ── */}
      <div className="-mx-1 flex-1 space-y-4 overflow-y-auto px-1 py-1">

        {/* Your name */}
        <Field label="Your name" required>
          <input
            className={calInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Raiyan Bin Rashid"
          />
        </Field>

        {/* Email */}
        <Field label="Email address" required>
          <input
            type="email"
            className={calInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        {/* Company name */}
        <Field label="Company name" required>
          <input
            className={calInput}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
          />
        </Field>

        {/* Company URL */}
        <Field label="Company URL" required>
          <input
            type="url"
            className={calInput}
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://acme.com"
          />
        </Field>

        {/* Services */}
        <Field label="What Services Do You Need?" required>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {SERVICES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={calChip(services.includes(s))}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Budget */}
        <Field label="Our Budget is" required>
          <div className="relative">
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={calSelect}
            >
              <option value="" disabled>Select a range…</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>

        {/* Project status */}
        <Field label="What Is Your Project Status?" required>
          <div className="relative">
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className={calSelect}
            >
              <option value="" disabled>Select status…</option>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>

        {/* Deadline */}
        <Field label="Our Deadline Is:" required>
          <input
            className={calInput}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g. Q3 2025 or Sept 1, 2025"
          />
        </Field>

        {/* Project description */}
        <Field label="Project Description" required>
          <textarea
            className={calTextarea}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: We are a tech startup looking to redesign our mobile app's to improve user engagement…"
          />
        </Field>

        {/* Add guests */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowGuestInput((p) => !p)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add guests
          </button>

          {showGuestInput && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  className={cn(calInput, "flex-1")}
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  placeholder="guest@example.com"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGuest(); } }}
                />
                <button
                  type="button"
                  onClick={addGuest}
                  className={cn(calMinimalBtn, "border-border")}
                >
                  Add
                </button>
              </div>
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {guests.map((g) => (
                    <span
                      key={g}
                      className="flex items-center gap-1 rounded-[10px] bg-muted px-2.5 py-1 text-xs text-foreground"
                    >
                      {g}
                      <button
                        type="button"
                        onClick={() => setGuests((p) => p.filter((x) => x !== g))}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Privacy notice ── */}
      <p className="mt-3 text-xs leading-normal text-muted-foreground/70">
        By proceeding, you agree to our{" "}
        <a href="/terms" className="text-foreground underline underline-offset-1 hover:no-underline">Terms</a>{" "}
        and{" "}
        <a href="/privacy" className="text-foreground underline underline-offset-1 hover:no-underline">Privacy Policy</a>.
      </p>

      {/* ── Error ── */}
      {error && (
        <p className="mt-2 text-sm text-red-500 leading-none" role="alert">{error}</p>
      )}

      {/* ── Footer buttons ── */}
      <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={onBack} className={calMinimalBtn}>
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className={calPrimaryBtn}
        >
          {loading ? "Submitting…" : "Confirm"}
        </button>
      </div>
    </form>
  );
}

// ── Main ScheduleForm ─────────────────────────────────────────────────────────

export function ScheduleForm() {
  const router = useRouter();
  const { data: session } = useSession();

  const [view, setView] = useState<"picker" | "form">("picker");
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);

  const {
    data: daysData,
    error: daysError,
    isLoading: daysLoading,
  } = useBookableDays();
  const {
    data: slotsData,
    isLoading: slotsLoading,
  } = useSlotsForDay(selectedDateKey);

  const bookableDays = daysData?.openDays ?? daysData?.bookableDays ?? [];
  const timezone = daysData?.timezone ?? slotsData?.timezone ?? "Asia/Dhaka";
  const slots = slotsData?.slots ?? [];
  const [success, setSuccess] = useState(false);

  const timeSlots: TimeSlot[] = useMemo(
    () =>
      slots.map(({ startAt, bookable }) => {
        try { return { time: formatSlotTimeKey(startAt), available: bookable }; }
        catch { return { time: "--:--", available: false }; }
      }),
    [slots],
  );

  const slotByTime = useMemo(() => {
    const map = new Map<string, string>();
    for (const { startAt, bookable } of slots) {
      if (!bookable) continue;
      try { map.set(formatSlotTimeKey(startAt), startAt); } catch {}
    }
    return map;
  }, [slots]);

  const hasOpenButUnbookableSlots =
    slots.length > 0 && slots.every(({ bookable }) => !bookable);

  function handleDateSelect(dateKey: string) {
    setSelectedDateKey(dateKey);
    setSelectedTime("");
    setSelectedSlotIso(null);
  }

  function handleTimeSelect(time: string) {
    const iso = slotByTime.get(time) ?? null;
    setSelectedTime(time);
    setSelectedSlotIso(iso);
    if (iso) setView("form");
  }

  function handleBack() {
    setView("picker");
    setSelectedSlotIso(null);
    setSelectedTime("");
  }

  function handleSuccess() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60 };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    setSuccess(true);

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    setTimeout(() => router.push("/dashboard"), duration);
  }

  return (
    <>
      {success ? (
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center rounded-2xl border border-border bg-background p-14 text-center shadow-sm">
          <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-foreground text-background shadow-[0px_10px_30px_rgba(0,0,0,0.12)]">
            <Check className="size-8" />
          </div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Booking request sent
          </p>
          <h2 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            We received your discovery call request.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            We&apos;ll confirm your discovery call by email within 24 hours.
            Redirecting to your dashboard...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(daysLoading || (selectedDateKey && slotsLoading)) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading availability...
            </div>
          )}

          <AppointmentScheduler
            userName="Hylith"
            meetingTitle="Discovery call"
            meetingType="Video call"
            duration="30 minutes"
            timezone={timezone}
            bookableDateKeys={bookableDays}
            highlightedDateKeys={daysData?.bookableDays ?? []}
            timeSlots={timeSlots}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            brandName="Hylith"
            initialSelectedTime={selectedTime}
            formContent={
              view === "form" && selectedSlotIso ? (
                <BookingFormPanel
                  selectedSlotIso={selectedSlotIso}
                  timezone={timezone}
                  prefillName={session?.user?.name ?? ""}
                  prefillEmail={session?.user?.email ?? ""}
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                />
              ) : undefined
            }
          />

          {hasOpenButUnbookableSlots && view === "picker" && (
            <p className="mx-auto max-w-5xl text-sm text-muted-foreground">
              Gray times start within {MIN_LEAD_HOURS} hour{MIN_LEAD_HOURS === 1 ? "" : "s"} or are already booked.
            </p>
          )}

          {daysError && (
            <p className="mx-auto max-w-5xl text-sm text-red-500">
              Error loading availability. Please refresh.
            </p>
          )}
        </div>
      )}
    </>
  );
}
