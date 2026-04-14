import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { token, newPassword } = await req.json();
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    
    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    
    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }
    
    // Find user by email with password field
    const user = await User.findOne({ email: resetToken.email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if new password is same as old
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json(
          { error: "New password must be different from current password" },
          { status: 400 }
        );
      }
    }
    
    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    
    // Mark token as used
    resetToken.used = true;
    await resetToken.save();
    
    // Delete all other used tokens for this user
    await PasswordResetToken.deleteMany({ email: user.email, used: true });
    
    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}