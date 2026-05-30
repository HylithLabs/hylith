import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-server";
import { AGENCY_TIMEZONE } from "@/lib/availability-constants";
import { isSlotInPast } from "@/lib/availability-client";
import {
  getPortalSettings,
  updatePortalSettings,
} from "@/lib/data/settings.repository";

const patchSchema = z.object({
  availableSlots: z.array(z.string().min(1)),
});

function normalizeSlotIso(value: unknown): string | null {
  const d = new Date(value as string | Date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function serializeSettings(settings: {
  availableSlots?: unknown;
  slotDurationMinutes?: number;
}) {
  const raw = settings.availableSlots;
  const list = Array.isArray(raw) ? raw : [];
  const availableSlots = list
    .map(normalizeSlotIso)
    .filter((s): s is string => s !== null);

  return {
    timezone: AGENCY_TIMEZONE,
    slotDurationMinutes: settings.slotDurationMinutes ?? 30,
    availableSlots,
  };
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await getPortalSettings();
  return NextResponse.json({ settings: serializeSettings(settings) });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const availableSlots = parsed.data.availableSlots
      .map(normalizeSlotIso)
      .filter((s): s is string => s !== null)
      .filter((s) => !isSlotInPast(s));

    const settings = await updatePortalSettings({
      availableSlots,
      timezone: AGENCY_TIMEZONE,
    });

    return NextResponse.json({
      settings: serializeSettings(settings),
    });
  } catch (error) {
    console.error("Update availability settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
