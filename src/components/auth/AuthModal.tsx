"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Image from "next/image";

type Mode = "login" | "register";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: Mode;
}

// ── Google Icon SVG ─────────────────────────────────────────
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ── Input Field Component (Optimized) ────────────────────────
function InputField({
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  rightElement,
}: {
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <Icon
        size={16}
        className="absolute left-4 text-gray-400 pointer-events-none z-10"
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 focus:border-[#004b9c] focus:bg-white focus:ring-2 focus:ring-[#004b9c]/10 rounded-xl pl-11 pr-10 py-3 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200"
      />
      {rightElement && <div className="absolute right-3">{rightElement}</div>}
    </div>
  );
}

// ── Coming Soon Toast ────────────────────────────────────────
function ComingSoonToast({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-gray-900 text-white text-[12px] font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap"
    >
      <span>🚧</span>
      Google login coming soon!
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ── Main Auth Modal ──
export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register fields (removed phone)
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");

  const switchMode = (m: Mode) => {
    setMode(m);
    setShowPass(false);
    setShowConfirmPass(false);
    setShowComingSoon(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  const handleGoogleClick = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Top Brand Strip */}
              <div className="h-1 bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />

              {/* Header */}
              <div className="relative px-6 pt-5 pb-4">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <X size={16} />
                </button>

                {/* Logo */}
                <div className="relative w-[100px] h-[32px] mb-4">
                  <Image
                    src="/ISportsCricket-Logo.png"
                    alt="iSPORTS"
                    fill
                    sizes="100px"
                    className="object-contain object-left"
                  />
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {(["login", "register"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchMode(m)}
                      className={`relative flex-1 py-2 rounded-lg text-[12px] font-bold tracking-wide transition-all capitalize ${
                        mode === m
                          ? "text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="authTab"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10">
                        {m === "login" ? "Sign In" : "Register"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-3"
                    >
                      <div>
                        <p className="text-[18px] font-bold text-gray-900">
                          Welcome Back
                        </p>
                        <p className="text-[12px] text-gray-400">
                          Sign in to your account
                        </p>
                      </div>

                      {/* Google Button */}
                      <button
                        type="button"
                        onClick={handleGoogleClick}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[12px] font-semibold text-gray-700 transition-all active:scale-[0.98]"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>

                      {/* Divider */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <InputField
                        type="email"
                        placeholder="Email address"
                        icon={Mail}
                        value={loginEmail}
                        onChange={setLoginEmail}
                      />

                      <InputField
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        icon={Lock}
                        value={loginPass}
                        onChange={setLoginPass}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPass ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        }
                      />

                      {/* Forgot password */}
                      <div className="flex justify-end -mt-1">
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-[#004b9c] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#004b9c] hover:bg-[#003d82] disabled:bg-[#004b9c]/70 text-white text-[12px] font-bold rounded-xl transition-all"
                      >
                        {loading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>

                      {/* Trust note */}
                      <div className="flex items-center justify-center gap-1.5">
                        <ShieldCheck size={11} className="text-[#81bf42]" />
                        <span className="text-[10px] text-gray-400">
                          Secure & encrypted
                        </span>
                      </div>

                      {/* Switch to register */}
                      <p className="text-center text-[11px] text-gray-500">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("register")}
                          className="font-bold text-[#004b9c] hover:underline"
                        >
                          Create one
                        </button>
                      </p>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-3"
                    >
                      <div>
                        <p className="text-[18px] font-bold text-gray-900">
                          Create Account
                        </p>
                        <p className="text-[12px] text-gray-400">
                          Join iSports Cricket today
                        </p>
                      </div>

                      {/* Google Button */}
                      <button
                        type="button"
                        onClick={handleGoogleClick}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[12px] font-semibold text-gray-700 transition-all active:scale-[0.98]"
                      >
                        <GoogleIcon />
                        Sign up with Google
                      </button>

                      {/* Divider */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <InputField
                        placeholder="Full name"
                        icon={User}
                        value={regName}
                        onChange={setRegName}
                      />

                      <InputField
                        type="email"
                        placeholder="Email address"
                        icon={Mail}
                        value={regEmail}
                        onChange={setRegEmail}
                      />

                      <InputField
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        icon={Lock}
                        value={regPass}
                        onChange={setRegPass}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPass ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        }
                      />

                      <InputField
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Confirm password"
                        icon={Lock}
                        value={regConfirmPass}
                        onChange={setRegConfirmPass}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPass ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        }
                      />

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#81bf42] hover:bg-[#6aad2e] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[12px] font-bold rounded-xl transition-all"
                      >
                        {loading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>

                      {/* Switch to login */}
                      <p className="text-center text-[11px] text-gray-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className="font-bold text-[#004b9c] hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Coming Soon Toast */}
              <AnimatePresence>
                {showComingSoon && (
                  <ComingSoonToast onClose={() => setShowComingSoon(false)} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
