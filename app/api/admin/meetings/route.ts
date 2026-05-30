import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-server";
import { listAssignmentsForAdmin } from "@/lib/data/assignments.repository";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const meetings = await listAssignmentsForAdmin();
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("Admin list meetings error:", error);
    return NextResponse.json({ error: "Failed to load meetings" }, { status: 500 });
  }
}
