"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Star,
  ChevronLeft,
} from "lucide-react";

// ─── Brand Palette ──────────────────────────────────────────────────
const BLUE = "#004b9c";
const GREEN = "#81bf42";
const BLUE_LIGHT = "#e8f0fb";
const GREEN_LIGHT = "#eef7e0";
const BLUE_MID = "#003d82";

// ─── Brand Ticker ───────────────────────────────────────────────────
const ALL_BRANDS = [
  "Gray-Nicolls",
  "SS Sports",
  "SG Cricket",
  "Kookaburra",
  "GM Cricket",
  "Spartan",
  "Adidas",
  "New Balance",
  "Puma",
  "MRF",
  "DSC",
  "CEAT",
  "BDM",
  "CA Sports",
  "Shrey",
];
const TICKER = [...ALL_BRANDS, ...ALL_BRANDS];

// ─── Slides ──────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 0,
    eyebrow: "New Season 2026",
    tag: "BATS · HELMETS · CLOTHING · SHOES",
    headline: ["Professional", "Cricket Gear"],
    sub: "Premium equipment trusted by 1,000+ players across the UAE. Same-day delivery in Sharjah & Ajman.",
    cta: { label: "Shop New Arrivals", href: "/shop" },
    sec: { label: "View All Brands", href: "/brands" },
    badge: { icon: Zap, text: "Same-Day Delivery" },
    stats: [
      { value: "15+", label: "Elite Brands" },
      { value: "1,000+", label: "Players" },
      { value: "AED 0", label: "COD Fee" },
    ],
    product: {
      name: "MRF Genius Grand Edition",
      cat: "English Willow · Grade 1",
      price: "AED 1,299",
      original: "AED 1,650",
      badge: "Best Seller",
      badgeGreen: true,
      image: "/Hero 1.png",
    },
  },
  {
    id: 1,
    eyebrow: "Exclusive Collection",
    tag: "ENGLISH WILLOW · KASHMIR WILLOW",
    headline: ["Elite Batting", "Equipment"],
    sub: "From Gray-Nicolls to SS — Grade 1 English Willow blades engineered to elevate your game.",
    cta: { label: "Explore Bats", href: "/category/bats" },
    sec: { label: "Order via WhatsApp", href: "#whatsapp" },
    badge: { icon: Shield, text: "Authenticity Guaranteed" },
    stats: [
      { value: "200+", label: "Bat Models" },
      { value: "24 hr", label: "UAE Shipping" },
      { value: "15+", label: "Brands" },
    ],
    product: {
      name: "Gray-Nicolls Omega XRD",
      cat: "Professional · English Willow",
      price: "AED 2,199",
      original: "AED 2,800",
      badge: "New Arrival",
      badgeGreen: false,
      image: "/Hero 2.png",
    },
  },
  {
    id: 2,
    eyebrow: "Protection First",
    tag: "SHREY · MOONWALKR · DSC",
    headline: ["ICC-Certified", "Helmets"],
    sub: "Cutting-edge Stem Guard technology. Safety meets premium design for the modern UAE cricketer.",
    cta: { label: "Shop Helmets", href: "/category/helmets" },
    sec: { label: "Find a Store", href: "/store-locator" },
    badge: { icon: Star, text: "ICC Certified" },
    stats: [
      { value: "50+", label: "Helmet Models" },
      { value: "3", label: "Locations" },
      { value: "100%", label: "ICC Certified" },
    ],
    product: {
      name: "Shrey Masterclass Air 2.0",
      cat: "ICC Certified · Stem Guard",
      price: "AED 899",
      original: "AED 1,100",
      badge: "Top Rated",
      badgeGreen: true,
      image: "/Hero 3.png",
    },
  },
];

function savePct(price, original) {
  const p = parseInt(price.replace(/\D/g, ""));
  const o = parseInt(original.replace(/\D/g, ""));
  return Math.round(((o - p) / o) * 100);
}

function CricketBall({ size = 200, color = BLUE, opacity = 0.08 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{ opacity }}
      className="pointer-events-none select-none"
    >
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M22 60 C32 38 54 32 60 18 C66 32 88 38 98 60 C88 82 66 88 60 102 C54 88 32 82 22 60Z"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
      />
      <path
        d="M12 48 Q60 40 108 48"
        fill="none"
        stroke={color}
        strokeWidth="0.9"
      />
      <path
        d="M12 72 Q60 80 108 72"
        fill="none"
        stroke={color}
        strokeWidth="0.9"
      />
      <path
        d="M28 28 Q44 42 44 60 Q44 78 28 92"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
      />
      <path
        d="M92 28 Q76 42 76 60 Q76 78 92 92"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
      />
    </svg>
  );
}

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDir] = useState(1);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDir(1);
      setActive((p) => (p + 1) % SLIDES.length);
    }, 5800);
    return () => clearInterval(t);
  }, [paused]);

  const goTo = (idx) => {
    if (idx === active) return;
    setDir(idx > active ? 1 : -1);
    setActive(idx);
    setPaused(true);
    setTimeout(() => setPaused(false), 9000);
  };

  const slide = SLIDES[active];

  // Variants for Content Transitions
  const txtV = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: (d) => ({
      x: d > 0 ? -30 : 30,
      opacity: 0,
      transition: { duration: 0.3 },
    }),
  };

  const cardV = {
    enter: { opacity: 0, y: 40, scale: 0.95 },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 0.1 },
    },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-white font-['Poppins'] selection:bg-blue-100 mt-6"
      style={{ minHeight: "calc(100vh - 173px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background Textures (Converted to Tailwind + Inline) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, ${BLUE}20 1.3px, transparent 1.3px)`,
          backgroundSize: "26px 26px",
        }}
      />

      {/* Blue Right Panel */}
      <div
        className="absolute top-0 right-0 bottom-0 pointer-events-none hidden lg:block"
        style={{
          width: "46%",
          background: `linear-gradient(150deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
          clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Grid overlay on blue panel */}
      <div
        className="absolute top-0 right-0 bottom-0 pointer-events-none hidden lg:block"
        style={{
          width: "46%",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* ── Floating Animated Elements (Framer Motion) ── */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20px] right-[6%] hidden lg:block"
      >
        <CricketBall size={240} color="rgba(255,255,255,0.08)" opacity={1} />
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[30%] hidden lg:block"
      >
        <CricketBall size={80} color="rgba(255,255,255,0.12)" opacity={1} />
      </motion.div>

      {/* ── Content Grid ── */}
      <div
        className="relative max-w-[1400px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 items-center gap-12 z-10"
        style={{
          minHeight: "calc(100vh - 220px)",
          paddingTop: "60px",
          paddingBottom: "100px",
        }}
      >
        {/* LEFT CONTENT */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={txtV}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-1 w-10 rounded-full"
                  style={{ background: GREEN }}
                />
                <span
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: GREEN }}
                >
                  {slide.tag}
                </span>
              </div>

              <div className="mb-6">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-full bg-[#e8f0fb] border border-[#004b9c15] text-[#004b9c]">
                  <slide.badge.icon size={12} strokeWidth={2.5} />
                  {slide.eyebrow}
                </span>
              </div>

              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight uppercase italic mb-8">
                <span className="block text-slate-900">
                  {slide.headline[0]}
                </span>
                <span
                  className="block"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `2px ${BLUE}`,
                  }}
                >
                  {slide.headline[1]}
                </span>
              </h1>

              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg mb-10 font-medium">
                {slide.sub}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  href={slide.cta.href}
                  className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-[#004b9c] to-[#0062cc] text-white text-sm font-bold uppercase tracking-widest shadow-[0_10px_30px_-10px_#004b9c] hover:shadow-[0_15px_40px_-10px_#004b9c] transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {slide.cta.label}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href={slide.sec.href}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#004b9c] text-sm font-bold uppercase tracking-widest hover:bg-slate-50 hover:border-[#004b9c30] transition-all"
                >
                  {slide.sec.label}
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="inline-flex bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-2">
                {slide.stats.map((s, i) => (
                  <div
                    key={i}
                    className={`flex flex-col px-8 py-3 ${i !== slide.stats.length - 1 ? "border-r border-slate-100" : ""}`}
                  >
                    <span
                      className="text-3xl font-black text-slate-900 leading-none mb-1"
                      style={{ color: i === 1 ? GREEN : BLUE }}
                    >
                      {s.value}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT CARD */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              variants={cardV}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full max-w-[400px] group"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-xl border border-white shadow-2xl shadow-blue-900/20 transition-transform duration-500 hover:-translate-y-2">
                {/* Product Badge */}
                <div className="absolute top-6 left-6 z-20">
                  <span
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                    style={{
                      background: slide.product.badgeGreen ? GREEN : BLUE,
                    }}
                  >
                    {slide.product.badge}
                  </span>
                </div>

                {/* Save Badge */}
                <div className="absolute top-6 right-6 z-20 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 border-[#81bf4240] bg-[#81bf4210] backdrop-blur-md">
                  <span className="text-[8px] font-black text-[#81bf42]">
                    SAVE
                  </span>
                  <span className="text-xs font-black text-[#81bf42]">
                    {savePct(slide.product.price, slide.product.original)}%
                  </span>
                </div>

                {/* Image Container */}
                <div className="relative h-[320px] w-full flex items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-[#e8f0fb] via-white to-[#eef7e0]">
                  <Image
                    src={slide.product.image}
                    alt={slide.product.name}
                    fill
                    className="object-contain drop-shadow-2xl p-8 scale-110 group-hover:scale-125 transition-transform duration-700"
                    priority
                  />
                  {/* Subtle Shine Sweep Effect */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
                  />
                </div>

                {/* Content */}
                <div className="p-8">
                  <p
                    className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                    style={{ color: GREEN }}
                  >
                    {slide.product.cat}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight mb-6 italic">
                    {slide.product.name}
                  </h3>

                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-[#004b9c]">
                        {slide.product.price}
                      </span>
                      <span className="text-sm text-slate-400 line-through font-medium">
                        {slide.product.original}
                      </span>
                    </div>
                    <Link
                      href="/shop"
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[#004b9c] hover:bg-[#004b9c] hover:text-white transition-all"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["COD", "Apple Pay", "Tabby", "Tamara"].map((m) => (
                      <span
                        key={m}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-500"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp Button Floating Below */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-center"
              >
                <a
                  href="#whatsapp"
                  className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-0.5"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order via WhatsApp
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation Arrows ── */}
      <button
        onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#004b9c] transition-all hover:scale-110 active:scale-95 hidden lg:flex border border-slate-100"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => goTo((active + 1) % SLIDES.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#004b9c] shadow-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 hidden lg:flex"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>

      {/* ── Progress Indicators ── */}
      <div className="absolute bottom-16 left-6 lg:left-16 flex items-center gap-4 z-20">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => goTo(idx)}
            className="group relative h-1.5 transition-all duration-500 rounded-full bg-slate-100 overflow-hidden"
            style={{ width: active === idx ? "60px" : "12px" }}
          >
            {active === idx && (
              <motion.div
                layoutId="progress-bar"
                className="absolute inset-y-0 left-0 bg-[#004b9c] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.8, ease: "linear" }}
              />
            )}
          </button>
        ))}
        <span className="text-xs font-bold tracking-widest text-[#004b9c40] ml-2">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Brand Ticker ── */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex items-center overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex items-center whitespace-nowrap"
        >
          {TICKER.map((brand, idx) => (
            <div key={idx} className="flex items-center px-8">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-400">
                {brand}
              </span>
              <span className="ml-8 text-[#81bf42] text-[6px]">◆</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
