import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { isAdminEmail } from "@/lib/admin";
import {
  findUserByEmail,
  upsertGoogleUser,
} from "@/lib/data/users.repository";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// UUID v4 pattern — any other format (e.g. Mongo ObjectId) is stale
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const { ensureAdminUser } = await import("@/lib/admin-server");
        await ensureAdminUser();

        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await findUserByEmail(email);

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          role: isAdminEmail(user.email) ? "admin" : user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const dbUser = await upsertGoogleUser({
          googleId: account.providerAccountId,
          email: profile.email,
          name: profile.name ?? profile.email.split("@")[0],
        });
        token.sub = dbUser.id;
        token.role = isAdminEmail(dbUser.email) ? "admin" : dbUser.role;
      }

      if (user?.id) {
        token.sub = user.id;
      }
      if (user?.email) {
        token.role = isAdminEmail(user.email) ? "admin" : "user";
      }

      // Heal stale session IDs left over from a previous DB (e.g. Mongo ObjectIds).
      // Only runs when the token already exists but sub doesn't look like a UUID.
      if (token.sub && token.email && !UUID_RE.test(token.sub)) {
        const dbUser = await findUserByEmail(token.email as string);
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = isAdminEmail(dbUser.email) ? "admin" : dbUser.role;
        }
      }

      return token;
    },
  },
});
