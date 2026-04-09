import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import connectDB from "./lib/mongodb";
import User from "./models/User";
import SiteSettings from "./models/SiteSettings";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";
  const isApiRoute = pathname.startsWith("/api");

  if (!isAdminRoute && !isApiRoute) return NextResponse.next();

  // Skip middleware for login page
  if (isLoginRoute) {
    if (token && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // For API routes, check but don't redirect
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Not logged in or not admin → redirect to login
  if (!token || token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // ✅ Session timeout and single device check - ONLY FOR ADMIN
  try {
    await connectDB();

    const settings = await SiteSettings.findOne();
    const sessionTimeoutHours = settings?.sessionTimeoutHours || 1;
    const singleDeviceOnly = settings?.singleDeviceOnly !== false;

    const user = await User.findById(token.id);

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // ✅ Single device check - ONLY FOR ADMIN (role check already done above)
    if (singleDeviceOnly && user.role === "ADMIN") {
      if (
        user.currentSessionToken &&
        user.currentSessionToken !== token.sessionToken
      ) {
        return NextResponse.redirect(
          new URL("/admin/login?error=session_conflict", req.url),
        );
      }
    }

    // ✅ Session timeout check - ONLY FOR ADMIN
    if (user.role === "ADMIN" && user.lastActiveAt) {
      const lastActive = new Date(user.lastActiveAt);
      const now = new Date();
      const hoursSinceActive =
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActive > sessionTimeoutHours) {
        // Clear session
        user.currentSessionToken = null;
        await user.save();
        return NextResponse.redirect(
          new URL("/admin/login?error=session_expired", req.url),
        );
      }
    }

    // Update last active for admin only
    if (user.role === "ADMIN") {
      user.lastActiveAt = new Date();
      await user.save();
    }
  } catch (error) {
    console.error("[Proxy Error]", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
