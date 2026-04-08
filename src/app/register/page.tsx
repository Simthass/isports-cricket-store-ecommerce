"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 8)
      return { strength: 1, label: "Too short", color: "bg-red-400" };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 0) return { strength: 1, label: "Weak", color: "bg-red-400" };
    if (score === 1)
      return { strength: 2, label: "Weak", color: "bg-orange-400" };
    if (score === 2)
      return { strength: 3, label: "Fair", color: "bg-yellow-400" };
    return { strength: 4, label: "Strong", color: "bg-[#81bf42]" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      setError(
        "Password must be 8+ characters with an uppercase letter, a number, and a special character (e.g. @, #, !).",
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Split full name into first and last name
      const fullName = form.name.trim();
      const spaceIndex = fullName.indexOf(" ");
      let firstName = fullName;
      let lastName = "";

      if (spaceIndex !== -1) {
        firstName = fullName.substring(0, spaceIndex);
        lastName = fullName.substring(spaceIndex + 1);
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: form.email.trim(),
          password: form.password,
          phone: form.phone?.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── JSX is here ──
  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#004b9c] relative overflow-hidden flex-col items-center justify-center p-12">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #81bf42 0%, transparent 50%), radial-gradient(circle at 80% 20%, #003d82 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #ffffff, #ffffff 1px, transparent 1px, transparent 60px)`,
          }}
        />

        <div className="relative z-10 text-center">
          <div className="relative w-[180px] h-[60px] mx-auto mb-10">
            <Image
              src="/ISportsCricket-Logo.png"
              alt="iSPORTS Cricket"
              fill
              sizes="180px"
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
            <span className="text-[#81bf42] text-[11px] font-black tracking-[0.25em] uppercase">
              Join iSPORTS
            </span>
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
          </div>
          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <span className="block text-4xl xl:text-5xl text-white italic">
              JOIN 1,000+
            </span>
            <span className="block text-4xl xl:text-5xl italic text-[#81bf42]">
              CRICKETERS.
            </span>
          </h1>
          <p className="text-blue-200 text-[15px] leading-relaxed max-w-sm mx-auto mb-10">
            Create your free account and get access to exclusive deals, faster
            checkout, and expert cricket advice.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              "Free delivery on orders over AED 500",
              "Exclusive member-only discounts",
              "Early access to new arrivals",
              "Expert bat fitting & advice",
              "Easy returns within 14 days",
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#81bf42]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2
                    size={12}
                    className="text-[#81bf42]"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-blue-100 text-[13px] font-medium">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden relative w-[140px] h-[48px] mx-auto mb-8">
            <Image
              src="/ISportsCricket-Logo.png"
              alt="iSPORTS Cricket"
              fill
              sizes="140px"
              className="object-contain"
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">
                Create Account
              </span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 italic uppercase leading-tight">
              Register
            </h2>
            <p className="text-gray-400 text-[14px] mt-1">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#004b9c] font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5"
            >
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-[13px] font-medium">{error}</p>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5"
            >
              <CheckCircle2
                size={16}
                className="text-green-500 flex-shrink-0"
              />
              <p className="text-green-600 text-[13px] font-medium">
                Account created! Redirecting to login...
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.8}
                />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ahmed Al Mansoori"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.8}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                Phone Number{" "}
                <span className="text-gray-300 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.8}
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+971 52 XXX XXXX"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.8}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 8 chars, uppercase, number, symbol"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      passwordStrength.strength <= 1
                        ? "text-red-400"
                        : passwordStrength.strength === 2
                          ? "text-orange-400"
                          : passwordStrength.strength === 3
                            ? "text-yellow-500"
                            : "text-[#81bf42]"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.8}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all bg-white ${
                    form.confirmPassword &&
                    form.password !== form.confirmPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : form.confirmPassword &&
                          form.password === form.confirmPassword
                        ? "border-[#81bf42] focus:border-[#81bf42] focus:ring-green-100"
                        : "border-gray-200 focus:border-[#004b9c] focus:ring-[#004b9c]/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {form.confirmPassword && (
                  <div className="absolute right-11 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword ? (
                      <CheckCircle2 size={15} className="text-[#81bf42]" />
                    ) : (
                      <AlertCircle size={15} className="text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="mt-2 flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-white text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-200 bg-[#004b9c] hover:bg-[#003d82] shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_8px_32px_rgba(0,75,156,0.4)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Account Created!
                </div>
              ) : (
                "Create Account — It's Free"
              )}
            </button>

            <p className="text-center text-[12px] text-gray-400 leading-relaxed">
              By registering you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#004b9c] hover:underline font-semibold"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#004b9c] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
            </p>
          </form>

          <p className="text-center text-[12px] text-gray-300 mt-8">
            © 2026 iSPORTS Cricket UAE. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
