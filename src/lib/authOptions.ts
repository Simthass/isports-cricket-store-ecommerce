// src/lib/authOptions.ts
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/models/User";

export const authOptions: NextAuthConfig = {
  providers: [
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

          // Cast to string — NextAuth v5 types these as unknown
          const email = credentials.email as string;
          const password = credentials.password as string;

          await dbConnect();

          const user = await User.findOne({ email });

          if (!user || !user.password) {
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            password,
            user.password as string,
          );

          if (!isCorrectPassword) {
            return null;
          }

          // Return the user object that matches NextAuth's User type
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as "ADMIN" | "CUSTOMER",
          } as any;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
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
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  debug: process.env.NODE_ENV === "development",
};
