import type { NextAuthConfig } from "next-auth";

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
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
