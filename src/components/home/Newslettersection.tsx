"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, Loader2, Sparkles } from "lucide-react";

export default function NewsletterSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const validate = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/home/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "homepage" }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setErrorMsg(data.error || "Failed to subscribe. Please try again.");
        setStatus("error");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setErrorMsg("Something went wrong. Please try again later.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setEmail("");
    setErrorMsg("");
  };

  return (
    <section ref={ref} className="relative w-full overflow-hidden my-0">
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/newsletter.jpg"
          alt="Cricket background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay — layered for depth */}
        <div className="absolute inset-0 bg-[#0a1628]/72" />
        {/* Blue tint gradient from left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#004b9c]/60 via-transparent to-[#004b9c]/40" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      {/* ── Top border accent — brand blue line ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />

      {/* ── Decorative corner glows ── */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#81bf42]/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#004b9c]/30 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* ── Subtle dot pattern overlay ── */}
      <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-5 lg:px-12 py-20 lg:py-28 flex flex-col items-center text-center gap-8">
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#81bf42]/40 bg-[#81bf42]/10 backdrop-blur-sm"
        >
          <Sparkles size={11} strokeWidth={2} className="text-[#81bf42]" />
          <span className="text-[#81bf42] text-[10.5px] font-semibold tracking-[0.22em] uppercase">
            Stay in the Game
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.46, delay: 0.08 }}
          className="flex flex-col items-center gap-3"
        >
          <h2 className="text-white font-black uppercase leading-[0.9] tracking-tight text-[clamp(2.4rem,5vw,4rem)]">
            Sign Up For Our{" "}
            <span className="text-transparent [-webkit-text-stroke:2px_#81bf42] [paint-order:stroke_fill]">
              Newsletter
            </span>
          </h2>

          {/* Divider row */}
          <div className="flex items-center gap-3 mt-1">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#81bf42]/60" />
            <div className="w-2 h-2 rounded-full bg-[#81bf42]" />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#81bf42]/60" />
          </div>

          <p className="text-white/60 text-[14px] font-normal leading-relaxed max-w-[480px] tracking-wide">
            Subscribe to get the latest cricket gear drops, exclusive UAE
            discounts, and pro tips — straight to your inbox.
          </p>
        </motion.div>

        {/* ── Email Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.48, delay: 0.26 }}
          className="w-full max-w-[560px]"
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38 }}
                className="flex flex-col items-center gap-3 py-6 px-8 rounded-2xl bg-[#81bf42]/15 border border-[#81bf42]/35 backdrop-blur-md"
              >
                <CheckCircle
                  size={40}
                  strokeWidth={1.8}
                  className="text-[#81bf42]"
                />
                <p className="text-white font-bold text-[17px]">
                  You're on the list! 🏏
                </p>
                <p className="text-white/55 text-[13px] font-normal">
                  Welcome aboard. Check your inbox for updates.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-white/50 text-[11px] font-medium hover:text-white/80 transition-colors"
                >
                  Subscribe another email →
                </button>
              </motion.div>
            ) : (
              /* ── Form State ── */
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                {/* Input + Button row — matches reference layout */}
                <div className="flex rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
                  {/* Mail icon inside input */}
                  <div className="flex items-center gap-3 flex-1 bg-[#0d1f3c]/80 backdrop-blur-md px-5">
                    <Mail
                      size={16}
                      strokeWidth={1.8}
                      className="text-white/35 flex-shrink-0"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Enter your email address"
                      className="flex-1 bg-transparent text-white text-[13.5px] font-normal
                                 placeholder-white/35 outline-none py-4 tracking-wide
                                 caret-[#81bf42]"
                    />
                  </div>

                  {/* Subscribe button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex items-center gap-2 px-7 py-4 bg-[#004b9c] hover:bg-[#003d82]
                               active:scale-95 transition-all duration-200
                               text-white text-[12px] font-bold tracking-[0.12em] uppercase
                               whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed
                               border-l border-white/10"
                  >
                    {status === "loading" ? (
                      <Loader2
                        size={15}
                        strokeWidth={2.5}
                        className="animate-spin"
                      />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight
                          size={13}
                          strokeWidth={2.8}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {status === "error" && errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-[12px] font-medium text-left pl-1"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Privacy note */}
                <p className="text-white/30 text-[11px] font-normal text-center tracking-wide">
                  By subscribing you agree to receive marketing emails.
                  Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.44, delay: 0.38 }}
          className="flex items-center gap-8 lg:gap-14 flex-wrap justify-center mt-2"
        >
          {[
            { value: "5,000+", label: "Subscribers" },
            { value: "Weekly", label: "Updates" },
            { value: "UAE", label: "Focused" },
          ].map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
              )}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-white font-black text-[1.5rem] leading-none tracking-tight">
                  {stat.value}
                </span>
                <span className="text-white/40 text-[10.5px] font-medium tracking-[0.18em] uppercase">
                  {stat.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom border accent ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
    </section>
  );
}
