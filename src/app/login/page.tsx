"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import Image from "next/image";

// ── Frontend validation ─────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateLoginForm(email: string, password: string): string | null {
  if (!email.trim()) return "Email address is required.";
  if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address.";
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

// ── Error type classifier ───────────────────────────────────────────
type ErrorType = "general" | "wrong_password" | "no_account" | "rate_limited";

function classifyError(errorMsg: string): { type: ErrorType; message: string } {
  if (errorMsg.startsWith("RATE_LIMITED:"))
    return { type: "rate_limited", message: errorMsg.replace("RATE_LIMITED:", "") };
  if (errorMsg.startsWith("WRONG_PASSWORD:"))
    return { type: "wrong_password", message: errorMsg.replace("WRONG_PASSWORD:", "") };
  if (errorMsg.startsWith("INVALID_CREDENTIALS:"))
    return { type: "no_account", message: errorMsg.replace("INVALID_CREDENTIALS:", "") };
  return { type: "general", message: "Something went wrong. Please try again." };
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on type
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError(null);
  };

  // Validate individual field on blur
  const handleBlur = (field: "email" | "password") => {
    if (field === "email" && form.email && !EMAIL_REGEX.test(form.email.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
    }
    if (field === "password" && form.password && form.password.length < 8) {
      setFieldErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters." }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation first
    const validationError = validateLoginForm(form.email, form.password);
    if (validationError) {
      setError({ type: "general", message: validationError });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        const classified = classifyError(result.error);
        setError(classified);
        setAttemptCount((c) => c + 1);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 1000);
      }
    } catch {
      setError({ type: "general", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Error icon / color by type
  const errorConfig: Record<ErrorType, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    general: {
      icon: <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
      bg: "bg-red-50", border: "border-red-200", text: "text-red-600",
    },
    wrong_password: {
      icon: <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />,
      bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700",
    },
    no_account: {
      icon: <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />,
      bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700",
    },
    rate_limited: {
      icon: <ShieldAlert size={16} className="text-red-600 flex-shrink-0" />,
      bg: "bg-red-100", border: "border-red-300", text: "text-red-700",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#004b9c] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 20% 80%, #81bf42 0%, transparent 50%), radial-gradient(circle at 80% 20%, #003d82 0%, transparent 50%)` }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(45deg, #ffffff, #ffffff 1px, transparent 1px, transparent 60px)` }} />
        <div className="relative z-10 text-center">
          <div className="relative w-[180px] h-[60px] mx-auto mb-10">
            <Image src="/ISportsCricket-Logo.png" alt="iSPORTS Cricket" fill className="object-contain" />
          </div>
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
            <span className="text-[#81bf42] text-[11px] font-black tracking-[0.25em] uppercase">Welcome Back</span>
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
          </div>
          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <span className="block text-4xl xl:text-5xl text-white italic">YOUR GAME.</span>
            <span className="block text-4xl xl:text-5xl italic text-[#81bf42]">YOUR GEAR.</span>
          </h1>
          <p className="text-blue-200 text-[15px] leading-relaxed max-w-sm mx-auto mb-10">
            Sign in to access your orders, saved items, and exclusive member deals.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
            {["Track your orders in real time", "Access exclusive member discounts", "Save your favourite gear", "Fast checkout every time"].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#81bf42]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={12} className="text-[#81bf42]" strokeWidth={2.5} />
                </div>
                <span className="text-blue-100 text-[13px] font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden relative w-[140px] h-[48px] mx-auto mb-8">
            <Image src="/ISportsCricket-Logo.png" alt="iSPORTS Cricket" fill className="object-contain" />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">Member Login</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 italic uppercase leading-tight">Sign In</h2>
            <p className="text-gray-400 text-[14px] mt-1">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#004b9c] font-bold hover:underline">Register now</Link>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${errorConfig[error.type].bg} border ${errorConfig[error.type].border} rounded-xl px-4 py-3 mb-5`}
            >
              {errorConfig[error.type].icon}
              <p className={`${errorConfig[error.type].text} text-[13px] font-medium`}>{error.message}</p>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5"
            >
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-green-600 text-[13px] font-medium">Login successful! Redirecting...</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} onBlur={() => handleBlur("email")}
                  required placeholder="your@email.com"
                  className={`w-full border rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all bg-white ${
                    fieldErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#004b9c] focus:ring-[#004b9c]/10"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-[11px] text-red-500 font-medium">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">Password</label>
                <Link href="/forgot-password" className="text-[12px] text-[#004b9c] font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input
                  type={showPassword ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} onBlur={() => handleBlur("password")}
                  required placeholder="••••••••"
                  className={`w-full border rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all bg-white ${
                    fieldErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#004b9c] focus:ring-[#004b9c]/10"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-[11px] text-red-500 font-medium">{fieldErrors.password}</p>}
            </div>

            {/* Attempt warning */}
            {attemptCount >= 3 && !error?.type.includes("rate") && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[12px] text-orange-600 font-semibold text-center bg-orange-50 border border-orange-200 rounded-lg py-2 px-3"
              >
                ⚠️ Account will be locked after {5 - attemptCount} more failed attempt(s).
              </motion.p>
            )}

            <button type="submit" disabled={loading || success || error?.type === "rate_limited"}
              className="mt-2 flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-white text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-200 bg-[#004b9c] hover:bg-[#003d82] shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_8px_32px_rgba(0,75,156,0.4)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : success ? (
                <div className="flex items-center gap-2"><CheckCircle2 size={16} /> Success!</div>
              ) : error?.type === "rate_limited" ? (
                "Account Locked"
              ) : (
                "Sign In"
              )}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <a href="https://wa.me/971526514666?text=Hi! I need help logging into my iSPORTS account."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-[13px] font-black tracking-wider uppercase transition-all duration-200 border-2 border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500 active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Need Help? Chat on WhatsApp
            </a>
          </form>

          <p className="text-center text-[12px] text-gray-300 mt-8">© 2026 iSPORTS Cricket UAE. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}