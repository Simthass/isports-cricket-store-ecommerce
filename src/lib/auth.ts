import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  getLoginAttemptStatus,
  recordFailedLogin,
  clearLoginAttempts,
} from "@/app/api/login/route";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // ── Rate limit check BEFORE hitting the DB ──────────────────
        const status = getLoginAttemptStatus(email);
        if (status.blocked) {
          const mins = Math.ceil(status.retryAfterSeconds / 60);
          throw new Error(
            `RATE_LIMITED:Account temporarily locked. Try again in ${mins} minute(s).`
          );
        }

        try {
          await connectDB();

          const user = await User.findOne({ email }).select("+password");

          // ── No account found ────────────────────────────────────────
          if (!user || !user.password) {
            recordFailedLogin(email);
            const updated = getLoginAttemptStatus(email);
            throw new Error(
              updated.blocked
                ? `RATE_LIMITED:Too many failed attempts. Account locked for 10 minutes.`
                : `INVALID_CREDENTIALS:No account found with that email. ${updated.attemptsLeft} attempt(s) remaining.`
            );
          }

          const isValid = await bcrypt.compare(password, user.password);

          // ── Wrong password ──────────────────────────────────────────
          if (!isValid) {
            recordFailedLogin(email);
            const updated = getLoginAttemptStatus(email);
            throw new Error(
              updated.blocked
                ? `RATE_LIMITED:Too many failed attempts. Account locked for 10 minutes.`
                : `WRONG_PASSWORD:Incorrect password. ${updated.attemptsLeft} attempt(s) remaining.`
            );
          }

          // ── Success — clear lockout counter ─────────────────────────
          clearLoginAttempts(email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? "User",
            role: user.role,
          };
        } catch (error) {
          // Re-throw our structured errors as-is, log unexpected ones
          if (error instanceof Error && (
            error.message.startsWith("RATE_LIMITED:") ||
            error.message.startsWith("WRONG_PASSWORD:") ||
            error.message.startsWith("INVALID_CREDENTIALS:")
          )) {
            throw error;
          }
          console.error("Auth error:", error);
          throw new Error("Something went wrong. Please try again.");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
      }
      return session;
    },
  },
});