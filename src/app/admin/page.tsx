"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex bg-white selection:bg-[#004b9c] selection:text-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >

      {/* ══════════════════════════════════════════════════
          LEFT PANEL — Dark branding panel
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col w-[46%] max-w-[680px] relative overflow-hidden bg-[#030d1f]">

        {/* ── Ambient glows ── */}
        <div className="absolute top-[-15%] left-[-15%] w-[480px] h-[480px] bg-[#004b9c] rounded-full blur-[140px] opacity-25 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[360px] h-[360px] bg-[#81bf42] rounded-full blur-[140px] opacity-10 pointer-events-none" />

        {/* ── Grid overlay ── */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />

        {/* ── Top brand rule ── */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />

        {/* ── Inner layout — flex col, center logo, content at bottom ── */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">

          {/* Top: small eyebrow label */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#81bf42] animate-pulse" />
            <span className="text-white/35 text-[10.5px] font-medium tracking-[0.26em] uppercase">
              Admin Portal
            </span>
          </div>

          {/* Center: Logo — big, centered */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center gap-6"
            >
              {/* Logo box */}
              <div
                className="relative w-[220px] h-[72px] p-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Image
                  src="/ISportsCricket-Logo.png"
                  alt="iSPORTS Cricket"
                  fill
                  className="object-contain p-3"
                  priority
                />
              </div>

              {/* Tagline under logo */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h1
                  className="text-white font-black uppercase italic leading-none tracking-tight"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "2.6rem",
                  }}
                >
                  Admin{" "}
                  <span
                    className="text-transparent"
                    style={{ WebkitTextStroke: "2px #81bf42", paintOrder: "stroke fill" }}
                  >
                    Center
                  </span>
                </h1>
                <p className="text-white/40 text-[13.5px] font-normal leading-relaxed max-w-[300px]">
                  Manage products, orders, customers, and store settings — all in one place.
                </p>
              </div>
            </motion.div>

            {/* Feature chips */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-2.5 w-full max-w-[290px]"
            >
              {[
                { dot: "#81bf42", text: "Manage products & inventory" },
                { dot: "#81bf42", text: "Process & track orders"      },
                { dot: "#81bf42", text: "View sales analytics"         },
                { dot: "#81bf42", text: "Configure store settings"     },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                  <span className="text-white/55 text-[12.5px] font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom: copyright */}
          <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
            <p className="text-white/25 text-[11.5px] font-medium">
              © {new Date().getFullYear()} iSPORTS Cricket UAE
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#81bf42] animate-pulse" />
              <span className="text-white/30 text-[10.5px] uppercase tracking-widest">
                Secure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL — Login form
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-[#f7f9fc] lg:bg-white relative">

        {/* Mobile logo */}
        <div className="absolute top-8 left-6 sm:left-10 lg:hidden">
          <div className="relative w-[140px] h-[44px]">
            <Image
              src="/ISportsCricket-Logo.png"
              alt="iSPORTS Cricket"
              fill
              className="object-contain object-left"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] mx-auto"
        >

          {/* ── Header ── */}
          <div className="mb-9">
            {/* Small pill label */}
            <div className="inline-flex items-center gap-2 bg-[#e8f0fb] border border-[#004b9c]/14 px-3.5 py-1.5 rounded-full mb-5">
              <ShieldCheck size={11} strokeWidth={2.2} className="text-[#004b9c]" />
              <span className="text-[#004b9c] text-[10.5px] font-semibold tracking-[0.18em] uppercase">
                Secure Login
              </span>
            </div>

            <h2 className="text-gray-900 font-bold text-[1.85rem] leading-tight tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-gray-400 text-[14px] font-normal leading-relaxed">
              Sign in to access the iSPORTS admin dashboard.
            </p>
          </div>

          {/* ── Error alert ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3.5">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <p className="text-[13px] font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.14em] ml-0.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-380 group-focus-within:text-[#004b9c] transition-colors duration-200"
                />
                <input
                  type="email"
                  placeholder="admin@isportscricket.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  className="
                    w-full bg-gray-50 border border-gray-200
                    rounded-xl pl-11 pr-4 py-[13px]
                    text-[13.5px] text-gray-900 placeholder-gray-380
                    outline-none
                    focus:bg-white focus:border-[#004b9c]
                    focus:ring-4 focus:ring-[#004b9c]/08
                    hover:border-gray-300
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.14em] ml-0.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-380 group-focus-within:text-[#004b9c] transition-colors duration-200"
                />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  className="
                    w-full bg-gray-50 border border-gray-200
                    rounded-xl pl-11 pr-12 py-[13px]
                    text-[13.5px] text-gray-900 placeholder-gray-380
                    outline-none
                    focus:bg-white focus:border-[#004b9c]
                    focus:ring-4 focus:ring-[#004b9c]/08
                    hover:border-gray-300
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.008 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="
                w-full flex items-center justify-center gap-2.5
                py-[14px] mt-1 rounded-xl
                text-white text-[13px] font-bold tracking-[0.08em] uppercase
                bg-[#004b9c] hover:bg-[#003d82]
                shadow-[0_6px_24px_rgba(0,75,156,0.32)]
                hover:shadow-[0_10px_32px_rgba(0,75,156,0.42)]
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={15} strokeWidth={2.8} />
                </>
              )}
            </motion.button>
          </form>

          {/* ── Footer links ── */}
          <div className="mt-10 flex flex-col items-center gap-5">
            {/* Security note */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full">
              <ShieldCheck size={13} strokeWidth={2} className="text-[#81bf42]" />
              <span className="text-gray-400 text-[11.5px] font-medium">
                Encrypted & secure session
              </span>
            </div>

            {/* Back to store */}
            <Link
              href="/"
              className="text-[13px] font-medium text-gray-400 hover:text-[#004b9c] transition-colors duration-150 flex items-center gap-1.5"
            >
              ← Back to store
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}