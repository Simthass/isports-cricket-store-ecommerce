// src/proxy.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// The function MUST be named 'proxy' in Next.js 16
export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Define which routes we are protecting
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  // 1. If it's not an admin route, let it pass
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // 2. Handle the Admin Login Page specifically
  if (isLoginRoute) {
    // If already logged in as ADMIN, skip login and go to dashboard
    if (token && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // Allow the login page to load for unauthenticated users
    return NextResponse.next();
  }

  // 3. Protect all other /admin/* routes
  // If no token or not an ADMIN, redirect to login
  if (!token || token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

// The matcher remains the same
export const config = {
  matcher: ["/admin/:path*"],
};
