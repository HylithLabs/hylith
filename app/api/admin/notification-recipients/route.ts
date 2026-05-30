import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-server";
import {
  addNotificationRecipient,
  deleteNotificationRecipient,
  listNotificationRecipients,
} from "@/lib/data/notification-recipients.repository";

const createSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const recipients = await listNotificationRecipients();
    return NextResponse.json({ recipients });
  } catch (error) {
    console.error("List notification recipients error:", error);
    return NextResponse.json(
      { error: "Failed to load recipients" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const recipient = await addNotificationRecipient(parsed.data.email);
    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add";
    if (message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }
    console.error("Add notification recipient error:", error);
    return NextResponse.json({ error: "Failed to add recipient" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const removed = await deleteNotificationRecipient(id);
    if (!removed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete notification recipient error:", error);
    return NextResponse.json(
      { error: "Failed to delete recipient" },
      { status: 500 },
    );
  }
}
