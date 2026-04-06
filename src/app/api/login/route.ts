import { NextRequest, NextResponse } from "next/server";

// ── In-memory login rate limiter (per email) ────────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

export function getLoginAttemptStatus(identifier: string): {
  blocked: boolean;
  attemptsLeft: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record || now > record.resetAt) {
    return { blocked: false, attemptsLeft: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return {
      blocked: true,
      attemptsLeft: 0,
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  return {
    blocked: false,
    attemptsLeft: MAX_ATTEMPTS - record.count,
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(identifier: string) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record || now > record.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + LOCKOUT_MS });
  } else {
    record.count++;
  }
}

export function clearLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}

// This route is just for exposing attempt status to the frontend
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const status = getLoginAttemptStatus(email.toLowerCase().trim());
  return NextResponse.json(status);
}
