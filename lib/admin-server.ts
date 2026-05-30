import bcrypt from "bcryptjs";
import { ADMIN_EMAIL, ADMIN_PASSWORD, isAdminEmail } from "@/lib/admin";
import { ensureAdminUser as ensureAdminInDb } from "@/lib/data/users.repository";

/** Ensures the admin account exists with the configured password. */
export async function ensureAdminUser(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await ensureAdminInDb(passwordHash);
}

export async function requireAdminSession() {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}
