import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import { requireAdminSession } from "@/lib/admin-server";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectMongoose();
  const meetings = await Meeting.find({
    status: { $in: ["pending", "confirmed", "closed"] },
  })
    .sort({ startAt: -1 })
    .lean();

  return NextResponse.json({
    meetings: meetings.map((m) => ({
      _id: m._id.toString(),
      userId: m.userId,
      email: m.email,
      name: m.name,
      startAt: m.startAt.toISOString(),
      timezone: m.timezone,
      status: m.status,
      projectSummary: m.projectSummary,
      company: m.company ?? null,
      phone: m.phone ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
