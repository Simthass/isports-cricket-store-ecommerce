import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select(
            "+password",
          );

          if (!user) {
            return null;
          }

          const isValid = bcrypt.compareSync(
            String(credentials.password),
            String(user.password),
          );

          if (!isValid) {
            return null;
          }

          // Generate new session token
          const sessionToken = generateSessionToken();

          // ✅ SINGLE DEVICE MODE - ONLY FOR ADMIN USERS
          if (user.role === "ADMIN") {
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
          }

          // Update user with new session token
          user.currentSessionToken = sessionToken;
          user.lastActiveAt = new Date();
          await user.save();

          // Return the user object that matches NextAuth's User type
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            sessionToken: sessionToken,
          } as any;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();

        try {
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user for Google sign-in
            const nameParts = user.name?.split(" ") || [];
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            existingUser = await User.create({
              name: user.name,
              firstName: firstName,
              lastName: lastName,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
              role: "CUSTOMER",
              password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
            });
          } else {
            // Update image if changed
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }
          }

          // Update session token
          const sessionToken = generateSessionToken();
          existingUser.currentSessionToken = sessionToken;
          existingUser.lastActiveAt = new Date();
          await existingUser.save();

          // Attach session token to user object
          (user as any).sessionToken = sessionToken;
          (user as any).id = existingUser._id.toString();
          (user as any).role = existingUser.role;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.sessionToken = (user as any).sessionToken;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
        (session as any).sessionToken = token.sessionToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // Default 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
});
