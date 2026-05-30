import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/admin";

export type ClientUser = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  passwordHash: string | null;
  googleId: string | null;
};

function rowToUser(row: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string | null;
  google_id: string | null;
}): ClientUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role === "admin" ? "admin" : "user",
    passwordHash: row.password_hash,
    googleId: row.google_id,
  };
}

function admin() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

export async function findUserByEmail(email: string): Promise<ClientUser | null> {
  const { data, error } = await admin()
    .from("clients")
    .select("id, email, name, role, password_hash, google_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data ? rowToUser(data) : null;
}

export async function findUserByGoogleId(
  googleId: string,
): Promise<ClientUser | null> {
  const { data, error } = await admin()
    .from("clients")
    .select("id, email, name, role, password_hash, google_id")
    .eq("google_id", googleId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToUser(data) : null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  role?: "user" | "admin";
}): Promise<ClientUser> {
  const { data, error } = await admin()
    .from("clients")
    .insert({
      id: randomUUID(),
      email: input.email.toLowerCase(),
      name: input.name,
      password_hash: input.passwordHash ?? null,
      google_id: input.googleId ?? null,
      role: input.role ?? "user",
    })
    .select("id, email, name, role, password_hash, google_id")
    .single();

  if (error) throw error;
  return rowToUser(data);
}

export async function upsertGoogleUser(input: {
  googleId: string;
  email: string;
  name: string;
}): Promise<ClientUser> {
  const existingByGoogle = await findUserByGoogleId(input.googleId);
  if (existingByGoogle) return existingByGoogle;

  const existingByEmail = await findUserByEmail(input.email);
  if (existingByEmail) {
    const { data, error } = await admin()
      .from("clients")
      .update({
        google_id: input.googleId,
        name: existingByEmail.name ?? input.name,
      })
      .eq("id", existingByEmail.id)
      .select("id, email, name, role, password_hash, google_id")
      .single();

    if (error) throw error;
    return rowToUser(data);
  }

  return createUser({
    email: input.email,
    name: input.name,
    googleId: input.googleId,
    role: input.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
  });
}

export async function ensureAdminUser(passwordHash: string): Promise<void> {
  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await findUserByEmail(email);

  if (!existing) {
    await createUser({
      email,
      name: "Admin",
      passwordHash,
      role: "admin",
    });
    return;
  }

  if (existing.passwordHash) return;

  const { error } = await admin()
    .from("clients")
    .update({ password_hash: passwordHash, role: "admin" })
    .eq("id", existing.id);

  if (error) throw error;
}
