"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showToast("error", "Email Required", "Please enter your email address");
      return;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Invalid Email", "Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        showToast("success", "Email Sent", "Check your inbox for password reset instructions");
      } else {
        showToast("error", "Failed", data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-4">
            We've sent password reset instructions to:
          </p>
          <p className="font-semibold text-[#004b9c] bg-gray-50 py-2 px-3 rounded-lg mb-6 break-all">
            {email}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#004b9c] font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Login
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
            <span className="text-[#81bf42] text-[11px] font-black tracking-[0.25em] uppercase">Reset Password</span>
            <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
          </div>
          <h1 className="font-black uppercase leading-none tracking-tight mb-6">
            <span className="block text-4xl xl:text-5xl text-white italic">FORGOT</span>
            <span className="block text-4xl xl:text-5xl italic text-[#81bf42]">PASSWORD?</span>
          </h1>
          <p className="text-blue-200 text-[15px] leading-relaxed max-w-sm mx-auto mb-10">
            Don't worry! Enter your email and we'll send you a link to reset your password.
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
            <h2 className="text-3xl font-black text-gray-900 italic uppercase leading-tight">Forgot Password?</h2>
            <p className="text-gray-400 text-[14px] mt-1">
              Remember your password?{" "}
              <Link href="/login" className="text-[#004b9c] font-bold hover:underline">Back to Login</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Enter the email address you used to register
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-white text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-200 bg-[#004b9c] hover:bg-[#003d82] shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_8px_32px_rgba(0,75,156,0.4)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
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