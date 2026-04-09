// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// ── In-memory rate limiter ──────────────────────────────────────────
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max attempts
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
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
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;

function validateRegisterInput(
  firstName: string | undefined,
  lastName: string | undefined,
  email: string | undefined,
  password: string | undefined,
) {
  const errors: string[] = [];

  // Check if firstName exists before calling trim()
  if (!firstName || typeof firstName !== "string") {
    errors.push("First name is required.");
  } else {
    if (firstName.trim().length < 2)
      errors.push("First name must be at least 2 characters.");
    if (firstName.trim().length > 60)
      errors.push("First name must be under 60 characters.");
  }

  // Check lastName if provided
  if (lastName && typeof lastName === "string" && lastName.trim().length > 60)
    errors.push("Last name must be under 60 characters.");

  // Email validation
  if (!email || typeof email !== "string") {
    errors.push("Email is required.");
  } else if (!EMAIL_REGEX.test(email.trim()))
    errors.push("Please enter a valid email address.");

  // Password validation
  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (!PASSWORD_REGEX.test(password))
    errors.push(
      "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.",
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
        },
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Please provide valid JSON." },
        { status: 400 },
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      city,
      emirate,
    } = body;

    // Validate inputs with proper error handling
    const validationErrors = validateRegisterInput(
      firstName,
      lastName,
      email,
      password,
    );
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0], details: validationErrors },
        { status: 400 },
      );
    }

    await connectDB();

    // Check for existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const fullName =
      `${firstName.trim()} ${lastName ? lastName.trim() : ""}`.trim();

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName?.trim() || "",
      name: fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      city: city?.trim() || "",
      emirate: emirate?.trim() || "",
      role: "CUSTOMER",
    });

    // Return success response without sensitive data
    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
