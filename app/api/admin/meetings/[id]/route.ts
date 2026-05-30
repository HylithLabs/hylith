import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-server";
import { updateAssignmentStatus } from "@/lib/data/assignments.repository";

const updateSchema = z.object({
  status: z.literal("closed"),
});

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidMeetingId(id: string) {
  return OBJECT_ID_RE.test(id) || UUID_RE.test(id);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  if (!isValidMeetingId(id)) {
    return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updated = await updateAssignmentStatus(id, "closed", {
      previousStatus: "pending",
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Meeting not found or already closed" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      meeting: { _id: id, status: "closed" },
    });
  } catch (error) {
    console.error("Admin update meeting error:", error);
    return NextResponse.json(
      {
        error: "Failed to update meeting",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
