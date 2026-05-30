import { connectMongoose } from "@/lib/mongoose";
import { Meeting } from "@/models/meeting";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  assignmentToMeetingDto,
  type AssignmentStatus,
  type MeetingDto,
} from "@/lib/supabase/types";

export async function listAssignmentsForClient(
  clientId: string,
): Promise<MeetingDto[]> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("client_id", clientId)
      .order("start_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(assignmentToMeetingDto);
  }

  await connectMongoose();
  const meetings = await Meeting.find({ userId: clientId })
    .sort({ startAt: 1 })
    .lean();

  return meetings.map((m) => ({
    _id: m._id.toString(),
    userId: m.userId,
    email: m.email,
    name: m.name,
    startAt: m.startAt.toISOString(),
    timezone: m.timezone,
    status: m.status as AssignmentStatus,
    projectSummary: m.projectSummary,
    company: m.company ?? null,
    phone: m.phone ?? null,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function listAssignmentsForAdmin(): Promise<MeetingDto[]> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .in("status", ["pending", "confirmed", "closed"])
      .order("start_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(assignmentToMeetingDto);
  }

  await connectMongoose();
  const meetings = await Meeting.find({
    status: { $in: ["pending", "confirmed", "closed"] },
  })
    .sort({ startAt: -1 })
    .lean();

  return meetings.map((m) => ({
    _id: m._id.toString(),
    userId: m.userId,
    email: m.email,
    name: m.name,
    startAt: m.startAt.toISOString(),
    timezone: m.timezone,
    status: m.status as AssignmentStatus,
    projectSummary: m.projectSummary,
    company: m.company ?? null,
    phone: m.phone ?? null,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function updateAssignmentStatus(
  id: string,
  status: AssignmentStatus,
  filter?: { previousStatus?: AssignmentStatus },
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from("assignments").update({ status }).eq("id", id);
    if (filter?.previousStatus) {
      query = query.eq("status", filter.previousStatus);
    }
    const { data, error } = await query.select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  await connectMongoose();
  const mongoose = await import("mongoose");
  const filterDoc: Record<string, unknown> = {
    _id: new mongoose.default.Types.ObjectId(id),
  };
  if (filter?.previousStatus) filterDoc.status = filter.previousStatus;

  const result = await Meeting.updateOne(filterDoc, { $set: { status } });
  return result.modifiedCount > 0;
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
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    await supabase.from("clients").upsert(
      {
        id: input.clientId,
        email: input.email.toLowerCase(),
        name: input.name,
        role: "user",
      },
      { onConflict: "id" },
    );

    const { data, error } = await supabase
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

  await connectMongoose();
  const meeting = await Meeting.create({
    userId: input.clientId,
    email: input.email,
    name: input.name,
    startAt: input.startAt,
    timezone: input.timezone,
    projectSummary: input.projectSummary,
    company: input.company,
    phone: input.phone,
  });

  return {
    _id: meeting._id.toString(),
    userId: meeting.userId,
    email: meeting.email,
    name: meeting.name,
    startAt: meeting.startAt.toISOString(),
    timezone: meeting.timezone,
    status: meeting.status as AssignmentStatus,
    projectSummary: meeting.projectSummary,
    company: meeting.company ?? null,
    phone: meeting.phone ?? null,
    createdAt: meeting.createdAt.toISOString(),
  };
}

export async function countPendingAssignments(clientId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { count, error } = await supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("status", "pending");

    if (error) throw error;
    return count ?? 0;
  }

  await connectMongoose();
  return Meeting.countDocuments({ userId: clientId, status: "pending" });
}

export async function listBookedStartTimes(): Promise<Date[]> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("assignments")
      .select("start_at")
      .in("status", ["pending", "confirmed"]);

    if (error) throw error;
    return (data ?? []).map((r) => new Date(r.start_at as string));
  }

  await connectMongoose();
  const booked = await Meeting.find({
    status: { $in: ["pending", "confirmed"] },
  }).select("startAt");
  return booked.map((m) => m.startAt);
}

export async function hasAssignmentConflict(startAt: Date): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("assignments")
      .select("id")
      .eq("start_at", startAt.toISOString())
      .in("status", ["pending", "confirmed"])
      .limit(1);

    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  await connectMongoose();
  const conflict = await Meeting.findOne({
    startAt,
    status: { $in: ["pending", "confirmed"] },
  });
  return Boolean(conflict);
}
