import type { NextAuthConfig } from "next-auth";
import { isAdminEmail } from "@/lib/admin";

/**
 * Edge-safe Auth.js config (middleware). Do not import MongoDB, bcrypt, or nodemailer here.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user?.email) {
        token.role = isAdminEmail(user.email) ? "admin" : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as "admin" | "user";
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
