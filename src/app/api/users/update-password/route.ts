// app/api/user/update-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

/**
 * PATCH /api/user/update-password
 * Verifies the user's current password, then replaces it with the new one.
 *
 * Body: { currentPassword: string; newPassword: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // ── Validate input ──────────────────────────────────────────────────
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both currentPassword and newPassword are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current password." },
        { status: 400 },
      );
    }

    await dbConnect();

    // ── Fetch the stored (hashed) password — field is normally excluded ─
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ── Verify current password ─────────────────────────────────────────
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    // ── Hash & save the new password ────────────────────────────────────
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("update-password PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
