import bcrypt from "bcryptjs";
import { getMongoClient } from "@/lib/mongodb";
import { ADMIN_EMAIL, ADMIN_PASSWORD, isAdminEmail } from "@/lib/admin";

/** Ensures the admin account exists with the configured password. */
export async function ensureAdminUser(): Promise<void> {
  const client = await getMongoClient();
  const users = client.db().collection("users");
  const email = ADMIN_EMAIL.toLowerCase();

  const existing = await users.findOne({ email });
  if (existing?.passwordHash) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  if (!existing) {
    await users.insertOne({
      name: "Admin",
      email,
      emailVerified: null,
      passwordHash,
      role: "admin",
      createdAt: new Date(),
    });
    return;
  }

  await users.updateOne(
    { email },
    { $set: { passwordHash, role: "admin", name: existing.name ?? "Admin" } },
  );
}

export async function requireAdminSession() {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}
