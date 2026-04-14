"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validatePassword = (pwd: string) => {
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    
    return { hasUppercase, hasLowercase, hasNumber, hasSpecial, isLongEnough };
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      showToast("error", "Weak Password", "Please meet all password requirements");
      return;
    }
    
    if (!doPasswordsMatch) {
      showToast("error", "Passwords Don't Match", "Please make sure your passwords match");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        showToast("success", "Password Reset", "Your password has been reset successfully");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        showToast("error", "Failed", data.error || "Unable to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
          <p className="text-gray-600 mb-4">
            Your password has been successfully reset.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting you to login page...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#004b9c] font-semibold hover:underline"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#004b9c] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 20% 80%, #81bf42 0%, transparent 50%), radial-gradient(circle at 80% 20%, #003d82 0%, transparent 50%)` }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(45deg, #ffffff, #ffffff 1px, transparent 1px, transparent 60px)` }} />
        <div className="relative z-10 text-center">
          <div className="relative w-[180px] h-[60px] mx-auto mb-10">
            <Image src="/ISportsCricket-Logo.png" alt="iSPORTS Cricket" fill className="object-contain" />
          </div>
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
            <span className="text-[#81bf42] text-[11px] font-black tracking-[0.25em] uppercase">Create New Password</span>
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
          </div>
          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <span className="block text-4xl xl:text-5xl text-white italic">SECURE YOUR</span>
            <span className="block text-4xl xl:text-5xl italic text-[#81bf42]">ACCOUNT</span>
          </h1>
          <p className="text-blue-200 text-[15px] leading-relaxed max-w-sm mx-auto mb-10">
            Create a strong, unique password to keep your account secure.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden relative w-[140px] h-[48px] mx-auto mb-8">
            <Image src="/ISportsCricket-Logo.png" alt="iSPORTS Cricket" fill className="object-contain" />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">Reset Password</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 italic uppercase leading-tight">Create New Password</h2>
            <p className="text-gray-400 text-[14px] mt-1">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">New Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">Confirm Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Password Requirements:</p>
              <ul className="space-y-1 text-xs">
                <li className={`flex items-center gap-2 ${passwordValidation.isLongEnough ? "text-green-600" : "text-gray-500"}`}>
                  <span>{passwordValidation.isLongEnough ? "✓" : "○"}</span> At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? "text-green-600" : "text-gray-500"}`}>
                  <span>{passwordValidation.hasUppercase ? "✓" : "○"}</span> At least one uppercase letter (A-Z)
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? "text-green-600" : "text-gray-500"}`}>
                  <span>{passwordValidation.hasLowercase ? "✓" : "○"}</span> At least one lowercase letter (a-z)
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                  <span>{passwordValidation.hasNumber ? "✓" : "○"}</span> At least one number (0-9)
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? "text-green-600" : "text-gray-500"}`}>
                  <span>{passwordValidation.hasSpecial ? "✓" : "○"}</span> At least one special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            {password && confirmPassword && !doPasswordsMatch && (
              <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2 border border-red-200">
                <AlertCircle size={16} className="text-red-500" />
                <p className="text-xs text-red-600 font-medium">Passwords do not match</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !doPasswordsMatch}
              className="mt-2 flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-white text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-200 bg-[#25D366] hover:bg-[#1ebe5d] shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_32px_rgba(37,211,102,0.4)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-[13px] font-black tracking-wider uppercase transition-all duration-200 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-[0.97]"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </form>

          <p className="text-center text-[12px] text-gray-300 mt-8">© 2026 iSPORTS Cricket UAE. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}