import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./dbConnect";
import User from "@/models/User";
import { randomBytes } from "crypto";

// Generate unique session token
function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = bcrypt.compareSync(
          String(credentials.password),
          String(user.password),
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Generate new session token
        const sessionToken = generateSessionToken();

        // Check if single device mode is enabled
        const SiteSettings = await import("@/models/SiteSettings").then(
          (m) => m.default,
        );
        const settings = await SiteSettings.findOne();

        if (
          settings?.singleDeviceOnly &&
          user.currentSessionToken &&
          user.currentSessionToken !== sessionToken
        ) {
          throw new Error(
            "Another session is active. Logout from other device first or use 'Logout All Devices'",
          );
        }

        // Update user with new session token
        user.currentSessionToken = sessionToken;
        user.lastActiveAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          sessionToken: sessionToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionToken = (user as any).sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
        session.sessionToken = token.sessionToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // Default 1 hour (will be overridden by settings)
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
});
