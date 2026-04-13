import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }

    // ✅ IMPORTANT: Use .select('+password') to include the password field
    const user = await User.findById(session.user.id).select('+password');
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a password set (for OAuth users)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google/Facebook login. Please use that method to sign in." },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}