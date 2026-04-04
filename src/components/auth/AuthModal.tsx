"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  X, Eye, EyeOff, Mail, Lock, User,
  ArrowRight, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import Image from "next/image";

type Mode = "login" | "register";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: Mode;
}

// ── Constants ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function InputField({
  type = "text", placeholder, icon: Icon, value, onChange, rightElement, hasError,
}: {
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  rightElement?: React.ReactNode;
  hasError?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <Icon size={16} className="absolute left-4 text-gray-400 pointer-events-none z-10" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-50 border rounded-xl pl-11 pr-10 py-3 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
          hasError
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-[#004b9c] focus:ring-[#004b9c]/10"
        }`}
      />
      {rightElement && <div className="absolute right-3">{rightElement}</div>}
    </div>
  );
}

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

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");

  // Field-level errors
  const [loginFieldErrors, setLoginFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [regFieldErrors, setRegFieldErrors] = useState<{
    name?: string; email?: string; password?: string; confirmPassword?: string;
  }>({});

  // ── Password strength ───────────────────────────────────────────
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 8) return { strength: 1, label: "Too short", color: "bg-red-400" };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 0) return { strength: 1, label: "Weak", color: "bg-red-400" };
    if (score === 1) return { strength: 2, label: "Weak", color: "bg-orange-400" };
    if (score === 2) return { strength: 3, label: "Fair", color: "bg-yellow-400" };
    return { strength: 4, label: "Strong", color: "bg-[#81bf42]" };
  };

  const passwordStrength = getPasswordStrength(regPass);

  const switchMode = (m: Mode) => {
    setMode(m);
    setShowPass(false);
    setShowConfirmPass(false);
    setShowComingSoon(false);
    setError("");
    setSuccess(false);
    setLoginFieldErrors({});
    setRegFieldErrors({});
  };

  const handleClose = () => {
    setError("");
    setSuccess(false);
    setLoginEmail("");
    setLoginPass("");
    setRegName("");
    setRegEmail("");
    setRegPass("");
    setRegConfirmPass("");
    setLoginFieldErrors({});
    setRegFieldErrors({});
    setLoginAttempts(0);
    setIsLocked(false);
    onClose();
  };

  // ── LOGIN ───────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginFieldErrors({});

    if (isLocked) {
      setError("Too many failed attempts. Please wait before trying again.");
      return;
    }

    // Field-level validation
    const fieldErrs: typeof loginFieldErrors = {};
    if (!loginEmail.trim() || !EMAIL_REGEX.test(loginEmail.trim())) {
      fieldErrs.email = "Please enter a valid email address.";
    }
    if (!loginPass) {
      fieldErrs.password = "Password is required.";
    } else if (loginPass.length < 8) {
      fieldErrs.password = "Password must be at least 8 characters.";
    }
    if (Object.keys(fieldErrs).length > 0) {
      setLoginFieldErrors(fieldErrs);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail.trim(),
        password: loginPass,
        redirect: false,
      });

      if (result?.error) {
        const newCount = loginAttempts + 1;
        setLoginAttempts(newCount);

        // Strip the prefix tag and show message
        const msg = result.error.replace(/^(RATE_LIMITED|WRONG_PASSWORD|INVALID_CREDENTIALS):/, "");
        setError(msg);

        // Frontend lockout after 5 fails
        if (newCount >= 5) {
          setIsLocked(true);
          setError("Too many failed attempts. Please wait 10 minutes before trying again.");
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
            setError("");
          }, 10 * 60 * 1000);
        }
      } else {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          router.refresh();
        }, 1000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegFieldErrors({});

    // Field-level validation
    const fieldErrs: typeof regFieldErrors = {};
    if (!regName.trim() || regName.trim().length < 2) {
      fieldErrs.name = "Name must be at least 2 characters.";
    }
    if (!regEmail.trim() || !EMAIL_REGEX.test(regEmail.trim())) {
      fieldErrs.email = "Please enter a valid email address.";
    }
    if (!regPass) {
      fieldErrs.password = "Password is required.";
    } else if (!PASSWORD_REGEX.test(regPass)) {
      fieldErrs.password = "Must be 8+ chars with uppercase, number & special character.";
    }
    if (!regConfirmPass) {
      fieldErrs.confirmPassword = "Please confirm your password.";
    } else if (regPass !== regConfirmPass) {
      fieldErrs.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(fieldErrs).length > 0) {
      setRegFieldErrors(fieldErrs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(async () => {
          await signIn("credentials", {
            email: regEmail.trim(),
            password: regPass,
            redirect: false,
          });
          handleClose();
          router.refresh();
        }, 1200);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
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
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <X size={16} />
                </button>

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
                        mode === m ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="authTab"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
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

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3 border ${
                        isLocked
                          ? "bg-red-100 border-red-300"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-600 text-[12px] font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3"
                    >
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      <p className="text-green-600 text-[12px] font-medium">
                        {mode === "login" ? "Signed in successfully!" : "Account created! Signing you in..."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">

                  {/* ── LOGIN FORM ── */}
                  {mode === "login" ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLogin}
                      className="flex flex-col gap-3"
                    >
                      <div>
                        <p className="text-[18px] font-bold text-gray-900">Welcome Back</p>
                        <p className="text-[12px] text-gray-400">Sign in to your account</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleClick}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[12px] font-semibold text-gray-700 transition-all active:scale-[0.98]"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <InputField
                          type="email"
                          placeholder="Email address"
                          icon={Mail}
                          value={loginEmail}
                          onChange={(v) => { setLoginEmail(v); setLoginFieldErrors((p) => ({ ...p, email: undefined })); }}
                          hasError={!!loginFieldErrors.email}
                        />
                        {loginFieldErrors.email && (
                          <p className="text-[11px] text-red-500 font-medium pl-1">{loginFieldErrors.email}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1">
                        <InputField
                          type={showPass ? "text" : "password"}
                          placeholder="Password"
                          icon={Lock}
                          value={loginPass}
                          onChange={(v) => { setLoginPass(v); setLoginFieldErrors((p) => ({ ...p, password: undefined })); }}
                          hasError={!!loginFieldErrors.password}
                          rightElement={
                            <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">
                              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          }
                        />
                        {loginFieldErrors.password && (
                          <p className="text-[11px] text-red-500 font-medium pl-1">{loginFieldErrors.password}</p>
                        )}
                      </div>

                      <div className="flex justify-end -mt-1">
                        <button type="button" className="text-[11px] font-semibold text-[#004b9c] hover:underline">
                          Forgot password?
                        </button>
                      </div>

                      {/* Attempt warning — shows at 3 fails */}
                      {loginAttempts >= 3 && !isLocked && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] text-orange-600 font-semibold text-center bg-orange-50 border border-orange-200 rounded-lg py-2 px-3"
                        >
                          ⚠️ {5 - loginAttempts} attempt(s) left before account is locked.
                        </motion.p>
                      )}

                      <button
                        type="submit"
                        disabled={loading || success || isLocked}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#004b9c] hover:bg-[#003d82] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-bold rounded-xl transition-all active:scale-[0.97]"
                      >
                        {loading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : success ? (
                          <><CheckCircle2 size={14} /> Signed In!</>
                        ) : isLocked ? (
                          "Account Locked"
                        ) : (
                          <>Sign In <ArrowRight size={13} /></>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-1.5">
                        <ShieldCheck size={11} className="text-[#81bf42]" />
                        <span className="text-[10px] text-gray-400">Secure & encrypted</span>
                      </div>

                      <p className="text-center text-[11px] text-gray-500">
                        Don't have an account?{" "}
                        <button type="button" onClick={() => switchMode("register")} className="font-bold text-[#004b9c] hover:underline">
                          Create one
                        </button>
                      </p>
                    </motion.form>

                  ) : (

                    /* ── REGISTER FORM ── */
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleRegister}
                      className="flex flex-col gap-3"
                    >
                      <div>
                        <p className="text-[18px] font-bold text-gray-900">Create Account</p>
                        <p className="text-[12px] text-gray-400">Join iSports Cricket today</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleClick}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[12px] font-semibold text-gray-700 transition-all active:scale-[0.98]"
                      >
                        <GoogleIcon />
                        Sign up with Google
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {/* Full Name */}
                      <div className="flex flex-col gap-1">
                        <InputField
                          placeholder="Full name"
                          icon={User}
                          value={regName}
                          onChange={(v) => { setRegName(v); setRegFieldErrors((p) => ({ ...p, name: undefined })); }}
                          hasError={!!regFieldErrors.name}
                        />
                        {regFieldErrors.name && (
                          <p className="text-[11px] text-red-500 font-medium pl-1">{regFieldErrors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <InputField
                          type="email"
                          placeholder="Email address"
                          icon={Mail}
                          value={regEmail}
                          onChange={(v) => { setRegEmail(v); setRegFieldErrors((p) => ({ ...p, email: undefined })); }}
                          hasError={!!regFieldErrors.email}
                        />
                        {regFieldErrors.email && (
                          <p className="text-[11px] text-red-500 font-medium pl-1">{regFieldErrors.email}</p>
                        )}
                      </div>

                      {/* Password + strength bar */}
                      <div className="flex flex-col gap-1">
                        <InputField
                          type={showPass ? "text" : "password"}
                          placeholder="Min. 8 chars, uppercase, number, symbol"
                          icon={Lock}
                          value={regPass}
                          onChange={(v) => { setRegPass(v); setRegFieldErrors((p) => ({ ...p, password: undefined })); }}
                          hasError={!!regFieldErrors.password}
                          rightElement={
                            <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">
                              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          }
                        />
                        {/* Strength bar */}
                        {regPass.length > 0 && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 flex gap-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                    level <= passwordStrength.strength
                                      ? passwordStrength.color
                                      : "bg-gray-100"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              passwordStrength.strength <= 1 ? "text-red-400" :
                              passwordStrength.strength === 2 ? "text-orange-400" :
                              passwordStrength.strength === 3 ? "text-yellow-500" :
                              "text-[#81bf42]"
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        )}
                        {regFieldErrors.password && (
                          <p className="text-[11px] text-red-500 font-medium pl-1">{regFieldErrors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="flex flex-col gap-1">
                        <InputField
                          type={showConfirmPass ? "text" : "password"}
                          placeholder="Confirm password"
                          icon={Lock}
                          value={regConfirmPass}
                          onChange={(v) => { setRegConfirmPass(v); setRegFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                          hasError={!!regFieldErrors.confirmPassword}
                          rightElement={
                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-gray-400 hover:text-gray-600">
                              {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          }
                        />
                        {/* Match indicator */}
                        {regConfirmPass && !regFieldErrors.confirmPassword && (
                          <p className={`text-[11px] font-medium pl-1 ${
                            regPass === regConfirmPass ? "text-[#81bf42]" : "text-red-500"
                          }`}>
                            {regPass === regConfirmPass ? "✓ Passwords match" : "✗ Passwords do not match"}
                          </p>
                        )}
                        {regFieldErrors.confirmPassword && (
                          <p className="text-[11px] text-red-500 font-medium pl-1">{regFieldErrors.confirmPassword}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || success}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#81bf42] hover:bg-[#6aad2e] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-bold rounded-xl transition-all active:scale-[0.97]"
                      >
                        {loading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : success ? (
                          <><CheckCircle2 size={14} /> Account Created!</>
                        ) : (
                          <>Create Account <ArrowRight size={13} /></>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-gray-500">
                        Already have an account?{" "}
                        <button type="button" onClick={() => switchMode("login")} className="font-bold text-[#004b9c] hover:underline">
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