import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import { requireAdminSession } from "@/lib/admin-server";

const updateSchema = z.object({
  status: z.literal("closed"),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectMongoose();
    const meeting = await Meeting.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), status: "pending" },
      { $set: { status: "closed" } },
      { new: true },
    );

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found or already closed" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      meeting: {
        _id: meeting._id.toString(),
        status: meeting.status,
      },
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
