import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    // ✅ Only clear session token for the admin user
    // This does NOT affect customer sessions
    await User.findByIdAndUpdate(session.user.id, {
      currentSessionToken: null,
      lastActiveAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    console.error("[Logout All]", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout from all devices" },
      { status: 500 },
    );
  }
}
