import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// ── In-memory rate limiter ──────────────────────────────────────────
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;          // max attempts
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = registerAttempts.get(ip);

  if (!record || now > record.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= RATE_LIMIT) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

// ── Validation helpers ──────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;

function validateRegisterInput(name: string, email: string, password: string) {
  const errors: string[] = [];

  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters.");
  if (name.trim().length > 60)
    errors.push("Name must be under 60 characters.");

  if (!email || !EMAIL_REGEX.test(email.trim()))
    errors.push("Please enter a valid email address.");

  if (!password)
    errors.push("Password is required.");
  else if (!PASSWORD_REGEX.test(password))
    errors.push(
      "Password must be at least 8 characters and include an uppercase letter, a number, and a special character."
    );

  return errors;
}

// ── Route handler ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const { allowed, retryAfterSeconds } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${Math.ceil(retryAfterSeconds / 60)} minute(s) before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();
    const { name, email, password, phone } = body;

    // Validate inputs
    const validationErrors = validateRegisterInput(name, email, password);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0] }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || undefined,
      role: "CUSTOMER",
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
