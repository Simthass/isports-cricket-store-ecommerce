import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json(
        { success: true, message: "If an account exists, you will receive a password reset email." },
        { status: 200 }
      );
    }
    
    // Delete any existing unused tokens for this user
    await PasswordResetToken.deleteMany({ email: user.email, used: false });
    
    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    // Save token to database
    await PasswordResetToken.create({
      email: user.email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    
    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;
    
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });
    
    return NextResponse.json(
      { success: true, message: "Password reset email sent successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}