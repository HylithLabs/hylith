import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  assignmentToMeetingDto,
  type AssignmentStatus,
  type MeetingDto,
} from "@/lib/supabase/types";

function admin() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

export async function listAssignmentsForClient(
  clientId: string,
): Promise<MeetingDto[]> {
  const { data, error } = await admin()
    .from("assignments")
    .select("*")
    .eq("client_id", clientId)
    .order("start_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(assignmentToMeetingDto);
}

export async function listAssignmentsForAdmin(): Promise<MeetingDto[]> {
  const { data, error } = await admin()
    .from("assignments")
    .select("*")
    .in("status", ["pending", "confirmed", "closed"])
    .order("start_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(assignmentToMeetingDto);
}

export async function getAssignmentForClient(
  id: string,
  clientId: string,
): Promise<MeetingDto | null> {
  const { data, error } = await admin()
    .from("assignments")
    .select("*")
    .eq("id", id)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  return data ? assignmentToMeetingDto(data) : null;
}

export async function deleteAssignmentForClient(
  id: string,
  clientId: string,
): Promise<boolean> {
  const { data, error } = await admin()
    .from("assignments")
    .delete()
    .eq("id", id)
    .eq("client_id", clientId)
    .eq("status", "pending")
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function updateAssignmentStatus(
  id: string,
  status: AssignmentStatus,
  filter?: { previousStatus?: AssignmentStatus },
): Promise<boolean> {
  let query = admin().from("assignments").update({ status }).eq("id", id);
  if (filter?.previousStatus) {
    query = query.eq("status", filter.previousStatus);
  }
  const { data, error } = await query.select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function createAssignment(input: {
  clientId: string;
  email: string;
  name: string;
  startAt: Date;
  timezone: string;
  projectSummary: string;
  company: string;
  phone: string;
}): Promise<MeetingDto> {
  await admin().from("clients").upsert(
    {
      id: input.clientId,
      email: input.email.toLowerCase(),
      name: input.name,
      role: "user",
    },
    { onConflict: "id" },
  );

  const { data, error } = await admin()
    .from("assignments")
    .insert({
      client_id: input.clientId,
      email: input.email,
      name: input.name,
      start_at: input.startAt.toISOString(),
      timezone: input.timezone,
      project_summary: input.projectSummary,
      company: input.company,
      phone: input.phone,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return assignmentToMeetingDto(data);
}

export async function countPendingAssignments(clientId: string): Promise<number> {
  const { count, error } = await admin()
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}

export async function listBookedStartTimes(): Promise<Date[]> {
  const { data, error } = await admin()
    .from("assignments")
    .select("start_at")
    .in("status", ["pending", "confirmed"]);

  if (error) throw error;
  return (data ?? []).map((r) => new Date(r.start_at as string));
}

export async function hasAssignmentConflict(startAt: Date): Promise<boolean> {
  const { data, error } = await admin()
    .from("assignments")
    .select("id")
    .eq("start_at", startAt.toISOString())
    .in("status", ["pending", "confirmed"])
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
