// src/app/not-found.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Home, ShoppingBag, ArrowRight, Zap } from "lucide-react";

// ── Count-up 0 → 404 ─────────────────────────────────────────────
function CountUp() {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1000;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(ease * 404));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <>{val}</>;
}

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, spring);
  const smoothY = useSpring(mouseY, spring);
  const rotateX = useTransform(smoothY, [-300, 300], [10, -10]);
  const rotateY = useTransform(smoothX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden selection:bg-[#004b9c] selection:text-white"
      style={{ background: "#fafbfc" }}
    >
      {/* ── Ambient aura blobs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Top-left — brand blue */}
        <div
          className="absolute top-[-12%] left-[-12%] w-[45%] h-[45%] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,75,156,0.10) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Bottom-right — brand green */}
        <div
          className="absolute bottom-[-12%] right-[-12%] w-[45%] h-[45%] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(129,191,66,0.10) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Centre soft wash */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,75,156,0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.038]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #004b9c 1.1px, transparent 1.1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Spatial border rays ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-28 bg-gradient-to-b from-[#004b9c]/25 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-28 bg-gradient-to-t from-[#81bf42]/25 to-transparent pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-px bg-gradient-to-r from-transparent to-[#004b9c]/15 pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-28 h-px bg-gradient-to-l from-transparent to-[#81bf42]/15 pointer-events-none" />

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5"
      >
        {/* Status pill */}
        <div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
          style={{
            background: "rgba(0,75,156,0.05)",
            borderColor: "rgba(0,75,156,0.12)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#81bf42] animate-pulse" />
          <span
            className="text-[9px] font-bold tracking-[0.25em] uppercase"
            style={{ color: "#004b9c" }}
          >
            Page Not Found
          </span>
        </div>
      </motion.div>

      {/* ── Main 3D tilt card ── */}
      <motion.main
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        {/* 404 Sculpture */}
        <div className="relative group cursor-default mb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center font-black leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {/* Ghost watermark layer */}
            <span
              className="absolute inset-0 flex items-center justify-center leading-none select-none pointer-events-none"
              style={{
                fontSize: "clamp(8.5rem,26vw,19rem)",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(0,75,156,0.07)",
                transform: "scale(1.04) translateY(3px)",
              }}
              aria-hidden
            >
              404
            </span>

            {/* Main gradient text */}
            <span
              className="relative leading-none"
              style={{
                fontSize: "clamp(8rem,25vw,18rem)",
                letterSpacing: "-0.04em",
                background:
                  "linear-gradient(155deg, #004b9c 0%, #0062cc 38%, #81bf42 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 32px rgba(0,75,156,0.12))",
              }}
            >
              <CountUp />
            </span>
          </motion.div>

          {/* Floating badge — "Route Not Found" */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-6 sm:-right-12 flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{
              background: "white",
              borderColor: "rgba(0,75,156,0.14)",
              boxShadow:
                "0 8px 24px rgba(0,75,156,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#004b9c",
                boxShadow: "0 0 0 3px rgba(0,75,156,0.15)",
              }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.22em] whitespace-nowrap"
              style={{ color: "#004b9c" }}
            >
              Route Not Found
            </span>
          </motion.div>

          {/* Floating badge — cricket */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-3 -left-4 sm:-left-14 flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{
              background: "white",
              borderColor: "rgba(129,191,66,0.22)",
              boxShadow:
                "0 8px 24px rgba(129,191,66,0.10), 0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <span className="text-[11px]">🏏</span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.22em] whitespace-nowrap"
              style={{ color: "#5a8f2a" }}
            >
              Off the pitch
            </span>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.4 }}
          className="flex items-center gap-3 mt-6 mb-7"
        >
          <div
            className="h-px w-12 sm:w-20"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,75,156,0.2))",
            }}
          />
          <div
            className="w-2 h-2 rounded-full rotate-45"
            style={{
              background: "#81bf42",
              boxShadow: "0 0 8px rgba(129,191,66,0.55)",
            }}
          />
          <div
            className="h-px w-12 sm:w-20"
            style={{
              background:
                "linear-gradient(270deg, transparent, rgba(0,75,156,0.2))",
            }}
          />
        </motion.div>

        {/* Headline + sub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.8 }}
          className="max-w-xl"
        >
          <h1
            className="font-extrabold tracking-tight text-slate-900 mb-3"
            style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", lineHeight: 1.15 }}
          >
            Outside the{" "}
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px #004b9c",
                fontStyle: "italic",
              }}
            >
              Boundary.
            </span>
          </h1>
          <p className="text-slate-400 text-[13.5px] sm:text-[15px] font-medium leading-relaxed mb-9 max-w-md mx-auto">
            You&apos;ve ventured into uncharted territory. Let&apos;s get you
            back to the main pitch.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary */}
            <Link href="/" className="relative group">
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                style={{ background: "#004b9c" }}
              />
              <button
                className="relative w-full sm:w-auto px-10 py-4 text-white rounded-2xl text-[12px] font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #004b9c, #0062cc)",
                  boxShadow: "0 8px 22px rgba(0,75,156,0.30)",
                }}
              >
                <Home size={15} strokeWidth={2.5} />
                Return Home
              </button>
            </Link>

            {/* Secondary */}
            <Link href="/shop" className="group">
              <button
                className="w-full sm:w-auto px-10 py-4 rounded-2xl text-[12px] font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "white",
                  border: "1.5px solid rgba(0,75,156,0.14)",
                  color: "#004b9c",
                  boxShadow: "0 4px 16px rgba(0,75,156,0.07)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(0,75,156,0.3)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 24px rgba(0,75,156,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(0,75,156,0.14)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 16px rgba(0,75,156,0.07)";
                }}
              >
                Shop Equipment
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.main>

      {/* ── Bottom meta footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-0 left-0 w-full px-8 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: "1px solid rgba(0,75,156,0.07)" }}
      >
        <div
          className="flex items-center gap-2.5 text-[10px] font-bold tracking-[0.28em] uppercase"
          style={{ color: "rgba(0,75,156,0.45)" }}
        >
          <Zap size={11} style={{ color: "#81bf42" }} />
          iSports - UAE&apos;S Premium Sports shop
        </div>

        {/* Brand ticker micro */}
        <div
          className="flex items-center gap-4 text-[9px] font-bold tracking-[0.22em] uppercase"
          style={{ color: "rgba(0,0,0,0.22)" }}
        >
          {["Support", "Status", "Safety"].map((l) => (
            <button
              key={l}
              className="transition-colors duration-200"
              style={{ color: "rgba(0,75,156,0.3)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#004b9c")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(0,75,156,0.3)")
              }
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full bg-[#81bf42]"
            style={{ boxShadow: "0 0 6px rgba(129,191,66,0.6)" }}
          />
          <span
            className="text-[9px] font-bold tracking-[0.26em] uppercase"
            style={{ color: "rgba(0,75,156,0.35)" }}
          >
            UAE&apos;s #1 Cricket Destination
          </span>
        </div>
      </motion.footer>
    </div>
  );
}
