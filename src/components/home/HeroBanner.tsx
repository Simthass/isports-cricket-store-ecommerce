"use client";

import React, { useEffect, useRef, useState } from "react";
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
      image: "/Hero 1.png", // Replace with actual image path
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
      image: "/Hero 2.png", // Replace with actual image path
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
      image: "/Hero 3.png", // Replace with actual image path
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────
function savePct(price, original) {
  const p = parseInt(price.replace(/\D/g, ""));
  const o = parseInt(original.replace(/\D/g, ""));
  return Math.round(((o - p) / o) * 100);
}

// ─── Cricket Ball SVG ─────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════
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

  const txtV = {
    enter: (d) => ({ x: d > 0 ? 44 : -44, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (d) => ({
      x: d > 0 ? -28 : 28,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    }),
  };
  const cardV = {
    enter: { opacity: 0, y: 32, scale: 0.94 },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.52,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -16,
      scale: 0.97,
      transition: { duration: 0.28, ease: "easeIn" },
    },
  };

  return (
    <>
      {/* ── Fonts & Global Styles ──────────────────────────────── */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Barlow:wght@400;500;600;700;800&display=swap');

      .hero-root { font-family: 'Barlow', sans-serif; }

      /* Subtle dot grid on white side */
      .hero-dots {
        background-image: radial-gradient(circle, ${BLUE}18 1.3px, transparent 1.3px);
        background-size: 26px 26px;
      }
      /* Fine line grid on blue panel */
      .hero-lines {
        background-image:
          linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
        background-size: 48px 48px;
      }

      /* Float keyframes */
      @keyframes fa { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(10deg)} }
      @keyframes fb { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-13px) rotate(-7deg)} }
      @keyframes fc { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(5deg)} }
      .fa{ animation:fa 9s  ease-in-out infinite }
      .fb{ animation:fb 7s  ease-in-out infinite }
      .fc{ animation:fc 11s ease-in-out infinite; animation-delay:2.4s }

      /* Progress bar */
      @keyframes prog { from{width:0%} to{width:100%} }
      .prog { animation:prog 5.8s linear forwards }

      /* Card shine sweep */
      @keyframes shine {
        0%   { transform:translateX(-100%) skewX(-20deg) }
        100% { transform:translateX(300%)  skewX(-20deg) }
      }
      .shine::after {
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent);
        animation:shine 3.8s ease-in-out infinite;
        animation-delay:1s;
        width:40%;
        pointer-events:none;
      }

      /* CTA hover */
      .btn-primary {
        background: linear-gradient(135deg, ${BLUE} 0%, #0062cc 100%);
        box-shadow: 0 6px 28px ${BLUE}44, inset 0 1px 0 rgba(255,255,255,0.14);
        transition: all .2s ease;
      }
      .btn-primary:hover {
        background: linear-gradient(135deg, ${BLUE_MID} 0%, ${BLUE} 100%);
        box-shadow: 0 10px 36px ${BLUE}58;
        transform: translateY(-1px);
      }
      .btn-primary:active { transform:translateY(0) }

      .btn-ghost {
        border: 1.5px solid ${BLUE}30;
        color: ${BLUE};
        background: ${BLUE}06;
        transition: all .2s ease;
      }
      .btn-ghost:hover {
        background: ${BLUE}0d;
        border-color: ${BLUE}55;
        transform: translateY(-1px);
      }

      .btn-wa {
        background: linear-gradient(135deg,#22c55e,#16a34a);
        box-shadow: 0 6px 22px rgba(34,197,94,.34);
        transition: all .2s ease;
      }
      .btn-wa:hover { transform:translateY(-1px); box-shadow:0 10px 30px rgba(34,197,94,.44) }

      /* Card lift */
      .card-lift { transition: transform .25s ease, box-shadow .25s ease }
      .card-lift:hover { transform:translateY(-5px); box-shadow:0 24px 64px ${BLUE}22 }

      /* Ticker mask */
      .ticker-wrap { mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent) }

      /* Trust hover */
      .trust-cell { transition:background .18s ease }
      .trust-cell:hover { background:${BLUE_LIGHT} }
    `}</style>

      {/* ══════════════════════════════════════════════════════
        HERO
    ══════════════════════════════════════════════════════ */}
      <section
        className="hero-root relative w-full overflow-hidden bg-white"
        style={{ minHeight: "calc(100vh - 173px)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* White-side dot texture */}
        <div className="absolute inset-0 hero-dots pointer-events-none opacity-60" />

        {/* ── Blue Right Panel ───────────────────────────────── */}
        <div
          className="absolute top-0 right-0 bottom-0 pointer-events-none hidden lg:block"
          style={{
            width: "46%",
            background: `linear-gradient(150deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
            clipPath: "polygon(7% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        />
        {/* Grid overlay on blue panel */}
        <div
          className="absolute top-0 right-0 bottom-0 hero-lines pointer-events-none hidden lg:block"
          style={{
            width: "46%",
            clipPath: "polygon(7% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        />
        {/* Green accent line at very bottom of blue panel */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none hidden lg:block"
          style={{
            width: "46%",
            height: "4px",
            background: `linear-gradient(90deg, ${GREEN}00, ${GREEN})`,
            clipPath: "polygon(7% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        />

        {/* ── Floating Balls ─────────────────────────────────── */}
        <div className="absolute top-[-30px] right-[5%] fa hidden lg:block">
          <CricketBall size={260} color="rgba(255,255,255,0.09)" opacity={1} />
        </div>
        <div className="absolute bottom-[18%] right-[28%] fb hidden lg:block">
          <CricketBall size={90} color="rgba(255,255,255,0.11)" opacity={1} />
        </div>
        <div className="absolute top-[25%] left-[1.5%] fc hidden lg:block">
          <CricketBall size={110} color={BLUE} opacity={0.07} />
        </div>
        <div
          className="absolute bottom-[10%] left-[33%] fa hidden lg:block"
          style={{ animationDelay: "3.5s" }}
        >
          <CricketBall size={60} color={GREEN} opacity={0.18} />
        </div>

        {/* ── Green horizontal accent rule on white side ──────── */}
        <div
          className="absolute left-0 bottom-[44px] hidden lg:block pointer-events-none"
          style={{
            width: "54%",
            height: "3px",
            background: `linear-gradient(90deg,${GREEN},${GREEN}00)`,
          }}
        />

        {/* ══════ CONTENT GRID ══════ */}
        <div
          className="relative max-w-[1400px] mx-auto px-5 lg:px-12 grid lg:grid-cols-2 items-center gap-0"
          style={{
            minHeight: "calc(100vh - 220px)",
            paddingTop: "56px",
            paddingBottom: "84px",
            zIndex: 4,
          }}
        >
          {/* ═══ LEFT TEXT ═══ */}
          <div className="flex flex-col justify-center pr-0 lg:pr-14 order-2 lg:order-1 pb-10 lg:pb-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`t-${active}`}
                custom={direction}
                variants={txtV}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Tag row */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="h-[3px] w-8 rounded-full"
                    style={{ background: GREEN }}
                  />
                  <span
                    className="text-[10px] font-bold tracking-[0.26em] uppercase"
                    style={{ color: GREEN }}
                  >
                    {slide.tag}
                  </span>
                </div>

                {/* Eyebrow */}
                <div className="mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold
                             tracking-[0.16em] uppercase px-3.5 py-1.5 rounded-full"
                    style={{
                      background: BLUE_LIGHT,
                      border: `1px solid ${BLUE}20`,
                      color: BLUE,
                    }}
                  >
                    <slide.badge.icon size={10} strokeWidth={2.8} />
                    {slide.eyebrow}
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="uppercase leading-[0.84] tracking-tight mb-6"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(3.6rem, 7.6vw, 7rem)",
                    fontWeight: 900,
                    fontStyle: "italic",
                  }}
                >
                  <span className="block text-gray-900">
                    {slide.headline[0]}
                  </span>
                  <span
                    className="block"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: `3px ${BLUE}`,
                      paintOrder: "stroke fill",
                    }}
                  >
                    {slide.headline[1]}
                  </span>
                </h1>

                {/* Sub */}
                <p className="text-gray-500 text-[15px] leading-[1.75] max-w-[450px] mb-8">
                  {slide.sub}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <Link
                    href={slide.cta.href}
                    className="btn-primary inline-flex items-center gap-2.5
                             px-7 py-[13px] rounded-xl text-white text-[12.5px]
                             font-bold tracking-[0.1em] uppercase"
                  >
                    {slide.cta.label}
                    <ArrowRight size={14} strokeWidth={2.8} />
                  </Link>
                  <Link
                    href={slide.sec.href}
                    className="btn-ghost inline-flex items-center gap-2
                             px-6 py-[12px] rounded-xl text-[12.5px]
                             font-bold tracking-[0.08em] uppercase"
                  >
                    {slide.sec.label}
                    <ChevronRight size={14} strokeWidth={2.8} />
                  </Link>
                </div>

                {/* Stats pill row */}
                <div
                  className="inline-flex rounded-2xl overflow-hidden border"
                  style={{
                    borderColor: `${BLUE}14`,
                    boxShadow: `0 4px 24px ${BLUE}0d`,
                    background: "white",
                  }}
                >
                  {slide.stats.map((s, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <div
                          style={{
                            width: "1px",
                            alignSelf: "stretch",
                            background: `linear-gradient(180deg,transparent,${BLUE}20,transparent)`,
                          }}
                        />
                      )}
                      <div className="flex flex-col px-6 py-[14px]">
                        <span
                          className="font-black leading-none"
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "1.9rem",
                            color: i === 1 ? GREEN : BLUE,
                          }}
                        >
                          {s.value}
                        </span>
                        <span
                          className="text-[10px] font-bold tracking-[0.14em]
                                       uppercase text-gray-400 mt-[3px]"
                        >
                          {s.label}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═══ RIGHT CARD ═══ */}
          <div
            className="relative flex items-center justify-center lg:justify-end
                        order-1 lg:order-2"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`c-${active}`}
                variants={cardV}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full max-w-[375px]"
              >
                {/* Card */}
                <div
                  className="card-lift relative rounded-3xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.97)",
                    boxShadow: `0 20px 60px ${BLUE}28, 0 0 0 1px rgba(255,255,255,0.8)`,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="shine relative overflow-hidden text-[10px] font-black
                               tracking-[0.15em] uppercase px-3 py-1.5 rounded-lg text-white"
                      style={{
                        background: slide.product.badgeGreen ? GREEN : BLUE,
                      }}
                    >
                      {slide.product.badge}
                    </span>
                  </div>

                  {/* Discount circle */}
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className="w-11 h-11 rounded-full flex flex-col items-center
                               justify-center text-center"
                      style={{
                        background: `${GREEN}18`,
                        border: `1.5px solid ${GREEN}45`,
                      }}
                    >
                      <span
                        className="text-[7.5px] font-black uppercase leading-none"
                        style={{ color: GREEN }}
                      >
                        SAVE
                      </span>
                      <span
                        className="text-[11px] font-black leading-none"
                        style={{ color: GREEN }}
                      >
                        {savePct(slide.product.price, slide.product.original)}%
                      </span>
                    </div>
                  </div>

                  {/* Image zone - Updated with Next.js Image */}
                  <div
                    className="relative flex items-center justify-center overflow-hidden"
                    style={{
                      height: "280px", // Increased from 236px
                      background: `linear-gradient(145deg, ${BLUE_LIGHT} 0%, #f4f8ff 55%, ${GREEN_LIGHT} 100%)`,
                    }}
                  >
                    {/* Bottom gradient rule */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[3px]"
                      style={{
                        background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`,
                      }}
                    />
                    {/* Product Image - Increased size */}
                    <div className="relative z-10 w-[240px] h-[240px]">
                      {" "}
                      {/* Increased from 160px to 200px */}
                      <Image
                        src={slide.product.image}
                        alt={slide.product.name}
                        fill
                        className="object-contain drop-shadow-xl"
                        sizes="(max-width: 768px) 200px, 200px"
                        priority={active === slide.id}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p
                      className="text-[10.5px] font-bold tracking-[0.2em] uppercase mb-1"
                      style={{ color: GREEN }}
                    >
                      {slide.product.cat}
                    </p>
                    <h3
                      className="font-black text-gray-900 leading-tight mb-4"
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "1.22rem",
                        fontStyle: "italic",
                      }}
                    >
                      {slide.product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-black"
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "1.65rem",
                            color: BLUE,
                            lineHeight: 1,
                          }}
                        >
                          {slide.product.price}
                        </span>
                        <span className="text-[13px] text-gray-400 line-through font-medium">
                          {slide.product.original}
                        </span>
                      </div>
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                                 text-[11px] font-bold tracking-wider uppercase
                                 transition-all hover:scale-105"
                        style={{
                          background: `${BLUE}0e`,
                          color: BLUE,
                          border: `1.5px solid ${BLUE}28`,
                        }}
                      >
                        View <ArrowRight size={11} strokeWidth={3} />
                      </Link>
                    </div>

                    {/* Payment chips */}
                    <div
                      className="flex items-center gap-1.5 flex-wrap pt-4"
                      style={{ borderTop: `1px solid ${BLUE}0e` }}
                    >
                      {["COD", "Apple Pay", "Tabby", "Tamara", "Card"].map(
                        (m) => (
                          <span
                            key={m}
                            className="text-[9px] font-bold tracking-wider uppercase
                                   px-2.5 py-1 rounded-md"
                            style={{
                              background: BLUE_LIGHT,
                              color: BLUE,
                              border: `1px solid ${BLUE}16`,
                            }}
                          >
                            {m}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp pill */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48 }}
                  className="mt-3 flex justify-center"
                >
                  <a
                    href="#whatsapp"
                    className="btn-wa inline-flex items-center gap-2.5 px-6 py-[10px]
                             rounded-full text-white text-[12px] font-bold tracking-wide"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="currentColor"
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

        {/* ══════ SLIDE NAVIGATION ══════ */}
        {/* Prev arrow */}
        <button
          onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                   items-center justify-center hidden lg:flex transition-all hover:scale-110"
          style={{
            background: "white",
            boxShadow: `0 4px 16px ${BLUE}20`,
            border: `1px solid ${BLUE}1a`,
          }}
        >
          <ChevronLeft size={16} strokeWidth={2.5} style={{ color: BLUE }} />
        </button>
        {/* Next arrow */}
        <button
          onClick={() => goTo((active + 1) % SLIDES.length)}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                   items-center justify-center hidden lg:flex transition-all hover:scale-110"
          style={{
            background: BLUE,
            boxShadow: `0 4px 18px ${BLUE}50`,
          }}
        >
          <ChevronRight size={16} strokeWidth={2.5} color="white" />
        </button>

        {/* Progress dots */}
        <div className="absolute bottom-[54px] left-5 lg:left-12 flex items-center gap-3 z-10">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goTo(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="relative rounded-full overflow-hidden transition-all duration-300"
              style={{
                width: active === idx ? 44 : 8,
                height: 4,
                background: active === idx ? "transparent" : `${BLUE}28`,
              }}
            >
              {active === idx && (
                <div
                  key={`p-${active}`}
                  className="prog absolute inset-y-0 left-0 rounded-full"
                  style={{ background: BLUE }}
                />
              )}
            </button>
          ))}
          <span
            className="text-[11px] font-bold tracking-widest ml-1"
            style={{ color: `${BLUE}45` }}
          >
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {/* ══════ BRAND TICKER ══════ */}
        <div
          className="absolute bottom-0 left-0 right-0 ticker-wrap overflow-hidden"
          style={{
            height: "44px",
            background: `linear-gradient(90deg,${BLUE}09,${BLUE}05,${BLUE}09)`,
            borderTop: `1px solid ${BLUE}12`,
          }}
        >
          <motion.div
            className="flex items-center h-full whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {TICKER.map((brand, idx) => (
              <span key={idx} className="flex items-center flex-shrink-0">
                <span
                  className="text-[10.5px] font-bold tracking-[0.22em] uppercase px-5"
                  style={{ color: `${BLUE}50` }}
                >
                  {brand}
                </span>
                <span
                  style={{ color: GREEN, fontSize: "6px", marginRight: "4px" }}
                >
                  ◆
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
