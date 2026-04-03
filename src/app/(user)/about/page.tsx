"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Truck,
  Star,
  Users,
  Award,
  MessageCircle,
  CheckCircle2,
  Globe,
  Zap,
} from "lucide-react";

// ─── Brand Colors ────────────────────────────────────────────────
const BLUE = "#004b9c";
const GREEN = "#81bf42";
const BLUE_LIGHT = "#e8f0fb";
const GREEN_LIGHT = "#eef7e0";

// ─── Reusable fade-up wrapper ────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.52, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section Eyebrow ────────────────────────────────────────────
function Eyebrow({ text }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-4">
      <div className="h-[3px] w-6 rounded-full bg-[#81bf42]" />
      <span
        className="text-[10.5px] font-semibold tracking-[0.26em] uppercase text-[#81bf42]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Value Card ──────────────────────────────────────────────────
function ValueCard({
  icon: Icon,
  title,
  desc,
  accent,
  accentLight,
  delay = 0,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.44, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col gap-4 p-7 rounded-2xl bg-white border border-[#004b9c]/08
                 shadow-[0_2px_16px_rgba(0,75,156,0.05)]
                 hover:shadow-[0_16px_48px_rgba(0,75,156,0.11)]
                 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Top accent bar grows on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"
        style={{ background: `linear-gradient(90deg, ${accent}, ${GREEN})` }}
      />
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accentLight, boxShadow: `0 4px 14px ${accent}20` }}
      >
        <Icon size={22} strokeWidth={1.7} style={{ color: accent }} />
      </div>
      <div>
        <h3 className="text-gray-900 font-bold text-[15px] mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-gray-400 text-[13.5px] font-normal leading-[1.75]">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function AboutPage() {
  return (
    <>
      <main
        className="w-full bg-white overflow-x-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* ════════════════════════════════════════════════════════
            §1  PAGE HEADER — editorial, asymmetric split
        ════════════════════════════════════════════════════════ */}
        <section className="relative w-full overflow-hidden bg-white pt-14 pb-0">
          {/* Top brand rule */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c] z-10" />
          {/* Dot texture */}
          <div className="absolute inset-0 opacity-40 pointer-events-none [background-image:radial-gradient(circle,#004b9c12_1.2px,transparent_1.2px)] [background-size:28px_28px]" />
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#81bf42]/07 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12">
            <div className="grid lg:grid-cols-[1fr_520px] gap-10 lg:gap-16 items-end">
              {/* — Left: headline + intro — */}
              <div className="pb-14 lg:pb-20">
                <FadeUp delay={0}>
                  <Eyebrow text="About iSPORTS" />
                </FadeUp>

                <FadeUp delay={0.07}>
                  <h1
                    className="uppercase font-black italic leading-[0.87] tracking-tight text-gray-900 mb-7"
                    style={{
                      fontSize: "clamp(3.2rem, 7vw, 6.4rem)",
                    }}
                  >
                    The UAE's
                    <br />
                    <span
                      className="text-transparent"
                      style={{
                        WebkitTextStroke: `3px ${BLUE}`,
                        paintOrder: "stroke fill",
                      }}
                    >
                      Home
                    </span>{" "}
                    For
                    <br />
                    <span style={{ color: GREEN }}>Cricket</span> Gear.
                  </h1>
                </FadeUp>

                <FadeUp delay={0.13}>
                  <p className="text-gray-500 text-[15.5px] font-normal leading-[1.85] max-w-[500px] mb-9">
                    iSPORTS Cricket was built for one reason — to make premium
                    cricket equipment genuinely accessible to every player in
                    the UAE. From Sharjah to Abu Dhabi, we're the trusted gear
                    partner for thousands of cricketers who take the game
                    seriously.
                  </p>
                </FadeUp>

                <FadeUp delay={0.18}>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white
                                 text-[12.5px] font-bold tracking-[0.1em] uppercase bg-[#004b9c]
                                 hover:bg-[#003d82] shadow-[0_6px_28px_rgba(0,75,156,0.35)]
                                 hover:shadow-[0_10px_36px_rgba(0,75,156,0.45)]
                                 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      Shop Now <ArrowRight size={14} strokeWidth={2.8} />
                    </Link>
                    <a
                      href="https://wa.me/971526514666"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[12.5px]
                                 font-bold tracking-[0.08em] uppercase border-[1.5px] border-[#004b9c]/25
                                 bg-[#004b9c]/05 text-[#004b9c] hover:bg-[#004b9c]/10
                                 hover:border-[#004b9c]/40 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp Us
                    </a>
                  </div>
                </FadeUp>
              </div>

              {/* — Right: stacked images — */}
              <FadeUp delay={0.1} className="relative self-end">
                {/* Main tall image */}
                <div className="relative rounded-t-3xl overflow-hidden h-[460px] shadow-[0_20px_60px_rgba(0,75,156,0.18)]">
                  <Image
                    src="/about.jpg" // ← your image
                    alt="iSPORTS Cricket Dubai"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width:1024px) 100vw, 520px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004b9c]/50 via-transparent to-transparent" />
                  <div className="absolute top-0 left-0 w-1 h-20 bg-gradient-to-b from-[#81bf42] to-transparent" />
                  {/* Location chip */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/12 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl">
                    <MapPin
                      size={11}
                      strokeWidth={2}
                      className="text-[#81bf42]"
                    />
                    <span className="text-white text-[11px] font-semibold tracking-wide">
                      Karama, Dubai
                    </span>
                  </div>
                </div>

                {/* Floating stat card — overlaps bottom of image */}
                <div className="absolute -bottom-7 left-5 right-5 bg-white rounded-2xl px-5 py-4 shadow-[0_8px_40px_rgba(0,75,156,0.15)] border border-[#004b9c]/08">
                  <div className="grid grid-cols-4 divide-x divide-[#004b9c]/08">
                    {[
                      { val: "1K+", lbl: "Players", color: BLUE },
                      { val: "15+", lbl: "Brands", color: GREEN },
                      { val: "3", lbl: "Stores", color: BLUE },
                      { val: "5★", lbl: "Rated", color: GREEN },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center text-center px-2 py-1"
                      >
                        <span
                          className="font-black leading-none text-[1.55rem]"
                          style={{
                            fontStyle: "italic",
                            color: s.color,
                          }}
                        >
                          {s.val}
                        </span>
                        <span className="text-gray-400 text-[9.5px] font-medium tracking-[0.14em] uppercase mt-0.5">
                          {s.lbl}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §2  WHO WE ARE — image mosaic + narrative text
        ════════════════════════════════════════════════════════ */}
        <section className="relative w-full bg-white py-28 lg:py-36 overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none [background-image:radial-gradient(circle,#004b9c10_1.2px,transparent_1.2px)] [background-size:28px_28px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#004b9c]/05 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">
              {/* — Left: image mosaic — */}
              <FadeUp delay={0}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tall left image */}
                  <div className="relative col-span-1 row-span-2 rounded-3xl overflow-hidden h-[380px] shadow-xl group">
                    <Image
                      src="/interior.jpg"
                      alt="iSPORTS Store Interior"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-600"
                      sizes="25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#004b9c]/35 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-[#004b9c] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-lg">
                      Our Store
                    </div>
                  </div>
                  {/* Top-right */}
                  <div className="relative rounded-2xl overflow-hidden h-[182px] shadow-lg group">
                    <Image
                      src="/helmet.jpg" // ← your image
                      alt="Cricket Equipment"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-600"
                      sizes="25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#81bf42]/15 to-transparent" />
                  </div>
                  {/* Bottom-right */}
                  <div className="relative rounded-2xl overflow-hidden h-[182px] shadow-lg group">
                    <Image
                      src="/about/cricket-player.jpg" // ← your image
                      alt="Cricket Player UAE"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-600"
                      sizes="25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#004b9c]/15 to-transparent" />
                    {/* Green corner accent */}
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#81bf42] rounded-tl-2xl opacity-80" />
                  </div>
                </div>
              </FadeUp>

              {/* — Right: text — */}
              <div className="flex flex-col gap-6">
                <FadeUp delay={0.07}>
                  <Eyebrow text="Who We Are" />
                  <h2
                    className="uppercase font-black italic leading-[0.88] tracking-tight text-gray-900"
                    style={{
                      fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                    }}
                  >
                    More Than A
                    <br />
                    <span style={{ color: BLUE }}>Cricket</span>{" "}
                    <span
                      className="text-transparent"
                      style={{
                        WebkitTextStroke: `2.5px ${GREEN}`,
                        paintOrder: "stroke fill",
                      }}
                    >
                      Equipment
                    </span>
                    <br />
                    Store.
                  </h2>
                </FadeUp>

                <FadeUp delay={0.13}>
                  <p className="text-gray-500 text-[14.5px] leading-[1.85] font-normal">
                    iSPORTS Cricket isn't just a shop — it's the hub of cricket
                    culture in the UAE. We stock professional-grade equipment
                    from the world's top 15 brands, and we back every purchase
                    with real human service. When you WhatsApp us, you speak to
                    someone who genuinely knows cricket.
                  </p>
                </FadeUp>

                <FadeUp delay={0.17}>
                  <p className="text-gray-500 text-[14.5px] leading-[1.85] font-normal">
                    Our physical stores serve as gathering points for the UAE
                    cricket community — from school-level players picking their
                    first bat, to club professionals sourcing tournament kits.
                    We understand what players need because we've been listening
                    to them for years.
                  </p>
                </FadeUp>

                <FadeUp delay={0.22}>
                  <div className="flex flex-col gap-3 mt-1">
                    {[
                      "100% authentic gear — every brand, every product, every time",
                      "Same-day delivery across Sharjah & Ajman",
                      "WhatsApp ordering — real experts, not bots",
                      "COD, Apple Pay, Tabby & Tamara installments",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2
                          size={16}
                          strokeWidth={2}
                          className="text-[#81bf42] flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-600 text-[13.5px] font-normal leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §3  STATS BAND — dark blue
        ════════════════════════════════════════════════════════ */}
        <section
          className="relative w-full overflow-hidden"
          style={{
            background: `linear-gradient(130deg, ${BLUE} 0%, #001e50 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#81bf42]/30 to-transparent" />

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12 py-14 lg:py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-white/10">
              {[
                {
                  val: "1,000+",
                  lbl: "Satisfied Customers",
                  color: "white",
                  delay: 0,
                },
                {
                  val: "15+",
                  lbl: "Premium Brands",
                  color: GREEN,
                  delay: 0.07,
                },
                {
                  val: "200+",
                  lbl: "Bat Models in Stock",
                  color: "white",
                  delay: 0.14,
                },
                {
                  val: "3",
                  lbl: "Physical Stores UAE",
                  color: GREEN,
                  delay: 0.21,
                },
              ].map((s, i) => {
                const ref = useRef(null);
                const inView = useInView(ref, { once: true, margin: "-30px" });
                return (
                  <motion.div
                    key={i}
                    ref={ref}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.38, delay: s.delay }}
                    className="flex flex-col items-center text-center px-6 py-8 lg:py-10"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span
                      className="font-black leading-none"
                      style={{
                        fontStyle: "italic",
                        fontSize: "2.8rem",
                        color: s.color,
                      }}
                    >
                      {s.val}
                    </span>
                    <span className="text-white/45 text-[10.5px] font-medium tracking-[0.16em] uppercase mt-2">
                      {s.lbl}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §4  OUR VALUES — 6-card grid
        ════════════════════════════════════════════════════════ */}
        <section className="relative w-full bg-[#f8faff] py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none [background-image:radial-gradient(circle,#004b9c10_1.2px,transparent_1.2px)] [background-size:28px_28px]" />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#81bf42]/07 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12">
            <FadeUp className="text-center mb-14">
              <Eyebrow text="What Drives Us" />
              <h2
                className="uppercase font-black italic leading-[0.9] tracking-tight text-gray-900"
                style={{
                  fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
                }}
              >
                Our Core <span style={{ color: BLUE }}>Values</span>
              </h2>
              <p className="text-gray-400 text-[14.5px] font-normal leading-relaxed max-w-[400px] mx-auto mt-4">
                Everything we do is shaped by a genuine commitment to the UAE
                cricket community.
              </p>
            </FadeUp>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: ShieldCheck,
                  title: "100% Authenticity",
                  desc: "Every product is sourced directly from official brand distributors. No counterfeits, no grey-market imports — your gear is always the real deal.",
                  accent: BLUE,
                  accentLight: BLUE_LIGHT,
                  delay: 0,
                },
                {
                  icon: Truck,
                  title: "Fast UAE Delivery",
                  desc: "Same-day delivery in Sharjah and Ajman. 24-hour UAE-wide shipping via Aramex. We know timing matters — whether it's a match tomorrow or a tournament next week.",
                  accent: GREEN,
                  accentLight: GREEN_LIGHT,
                  delay: 0.07,
                },
                {
                  icon: MessageCircle,
                  title: "WhatsApp-First Service",
                  desc: "Real humans answer your messages. Ask about bat weight, helmet sizing, or bulk kit orders — we're here with expert advice, not automated chatbots.",
                  accent: BLUE,
                  accentLight: BLUE_LIGHT,
                  delay: 0.14,
                },
                {
                  icon: Award,
                  title: "Expert Curation",
                  desc: "Our 15 brands are chosen because they're proven in professional cricket — from Gray-Nicolls to MRF. Every product in our catalog earns its place.",
                  accent: GREEN,
                  accentLight: GREEN_LIGHT,
                  delay: 0.21,
                },
                {
                  icon: Users,
                  title: "Community Focused",
                  desc: "We serve school academies, professional clubs, and weekend players equally. Whether you're buying your first bat or equipping an entire squad, you get the same attention.",
                  accent: BLUE,
                  accentLight: BLUE_LIGHT,
                  delay: 0.28,
                },
                {
                  icon: Globe,
                  title: "UAE Built & Trusted",
                  desc: "Based in Karama, Dubai — we understand UAE cricket culture, its leagues, and its players. We're not a global warehouse; we're your local cricket partner.",
                  accent: GREEN,
                  accentLight: GREEN_LIGHT,
                  delay: 0.35,
                },
              ].map((v, i) => (
                <ValueCard key={i} {...v} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §5  WHAT MAKES US DIFFERENT — two zigzag rows
        ════════════════════════════════════════════════════════ */}
        <section className="relative w-full bg-white py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:radial-gradient(circle,#004b9c10_1.2px,transparent_1.2px)] [background-size:28px_28px]" />

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12 flex flex-col gap-24 lg:gap-32">
            {/* — Row A: image left, text right — */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <FadeUp delay={0}>
                <div className="relative rounded-3xl overflow-hidden h-[380px] shadow-2xl group">
                  <Image
                    src="/Bats 2.jpg" // ← your image
                    alt="Cricket Bat Collection UAE"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#004b9c]/30 to-transparent" />
                  <div className="absolute top-0 left-0 w-1 h-20 bg-gradient-to-b from-[#81bf42] to-transparent" />
                  <div className="absolute bottom-5 left-5 bg-[#004b9c] text-white text-[10.5px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl shadow-lg">
                    200+ Bat Models
                  </div>
                </div>
              </FadeUp>

              <div className="flex flex-col gap-5">
                <FadeUp delay={0.08}>
                  <Eyebrow text="Our Range" />
                  <h2
                    className="uppercase font-black italic leading-[0.88] tracking-tight text-gray-900"
                    style={{
                      fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
                    }}
                  >
                    The Widest
                    <br />
                    <span style={{ color: BLUE }}>Cricket Range</span>
                    <br />
                    In The <span style={{ color: GREEN }}>UAE.</span>
                  </h2>
                </FadeUp>
                <FadeUp delay={0.13}>
                  <p className="text-gray-500 text-[14.5px] leading-[1.85] font-normal">
                    From Grade 1 English Willow bats to ICC-certified helmets,
                    from professional spike shoes to complete training kits —
                    our catalog covers every aspect of the game at every level.
                    We carry products you simply can't find anywhere else in the
                    UAE.
                  </p>
                </FadeUp>
                <FadeUp delay={0.18}>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      "Bats & Willow",
                      "Helmets & Pads",
                      "Shoes & Spikes",
                      "Clothing & Kits",
                      "Gloves & Guards",
                      "Bags & Accessories",
                    ].map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-[#e8f0fb] border border-[#004b9c]/08"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#81bf42] flex-shrink-0" />
                        <span className="text-[#004b9c] text-[12.5px] font-semibold">
                          {cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </div>

            {/* — Row B: text left, image right — */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="flex flex-col gap-5 order-2 lg:order-1">
                <FadeUp delay={0.06}>
                  <Eyebrow text="Our Service" />
                  <h2
                    className="uppercase font-black italic leading-[0.88] tracking-tight text-gray-900"
                    style={{
                      fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
                    }}
                  >
                    Ordering Has
                    <br />
                    Never Been{" "}
                    <span
                      className="text-transparent"
                      style={{
                        WebkitTextStroke: `2px ${BLUE}`,
                        paintOrder: "stroke fill",
                      }}
                    >
                      Easier.
                    </span>
                  </h2>
                </FadeUp>
                <FadeUp delay={0.12}>
                  <p className="text-gray-500 text-[14.5px] leading-[1.85] font-normal">
                    Our WhatsApp-first checkout was built for real people.
                    Browse the website, add items to your cart, then confirm
                    your order over WhatsApp — where a real team member confirms
                    availability, answers your questions, and arranges delivery
                    on the spot.
                  </p>
                </FadeUp>
                <FadeUp delay={0.16}>
                  <div className="flex flex-col gap-3 mt-1">
                    {[
                      {
                        icon: MessageCircle,
                        text: "WhatsApp order confirmation in minutes",
                      },
                      {
                        icon: Zap,
                        text: "Same-day delivery in Sharjah & Ajman",
                      },
                      {
                        icon: Star,
                        text: "Post-purchase loyalty discounts & rewards",
                      },
                    ].map(({ icon: Icon, text }, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3.5 py-3.5 px-4 rounded-xl bg-white border border-[#004b9c]/08 shadow-[0_2px_10px_rgba(0,75,156,0.05)]"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#eef7e0] flex items-center justify-center flex-shrink-0">
                          <Icon
                            size={16}
                            strokeWidth={1.8}
                            className="text-[#81bf42]"
                          />
                        </div>
                        <span className="text-gray-700 text-[13.5px] font-medium">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>

              <FadeUp delay={0} className="order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden h-[380px] shadow-2xl group">
                  <Image
                    src="/about/whatsapp-ordering.jpg" // ← your image
                    alt="WhatsApp Cricket Ordering"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tl from-[#004b9c]/30 to-transparent" />
                  <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/12 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-[#81bf42] animate-pulse" />
                    <span className="text-white text-[11px] font-semibold tracking-wide">
                      We Reply Fast
                    </span>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §6  STORE LOCATIONS
        ════════════════════════════════════════════════════════ */}
        <section className="relative w-full bg-[#f8faff] py-24 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none [background-image:radial-gradient(circle,#004b9c10_1.2px,transparent_1.2px)] [background-size:28px_28px]" />

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12">
            <FadeUp className="text-center mb-14">
              <Eyebrow text="Find Us" />
              <h2
                className="uppercase font-black italic leading-[0.9] tracking-tight text-gray-900"
                style={{
                  fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                }}
              >
                Visit Our <span style={{ color: BLUE }}>Stores</span>
              </h2>
              <p className="text-gray-400 text-[14.5px] font-normal leading-relaxed max-w-[360px] mx-auto mt-4">
                Drop in, try the gear, talk cricket. Our team is always ready to
                help.
              </p>
            </FadeUp>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  city: "Dubai",
                  area: "Karama",
                  address: "13 B Street, Karama, Dubai, UAE",
                  phone: "+971 4 353 3323",
                  hours: "10:00 AM – 7:00 PM  ·  Mon – Sat",
                  image: "/Map 1.jpg",
                  badge: "Main Branch",
                  badgeColor: BLUE,
                  delay: 0,
                },
                {
                  city: "Sharjah",
                  area: "Al Wahda",
                  address: "Al Wahda Street, Sharjah, UAE",
                  phone: "+971 52 651 4666",
                  hours: "10:00 AM – 8:00 PM  ·  Mon – Sun",
                  image: "/Map 2.jpg", // ← your image
                  badge: "Same-Day Delivery",
                  badgeColor: GREEN,
                  delay: 0.1,
                },
              ].map((store, i) => (
                <FadeUp key={i} delay={store.delay}>
                  <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#004b9c]/08 shadow-[0_2px_16px_rgba(0,75,156,0.06)] hover:shadow-[0_16px_48px_rgba(0,75,156,0.12)] hover:-translate-y-1 transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={store.image}
                        alt={`iSPORTS ${store.city}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-600"
                        sizes="(max-width:768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#004b9c]/45 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span
                          className="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg"
                          style={{ background: store.badgeColor }}
                        >
                          {store.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span
                          className="text-white font-black italic uppercase leading-none"
                          style={{
                            fontSize: "1.65rem",
                          }}
                        >
                          {store.city} · {store.area}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 flex flex-col gap-3.5">
                      {[
                        { icon: MapPin, text: store.address },
                        { icon: Phone, text: store.phone },
                        { icon: Clock, text: store.hours },
                      ].map(({ icon: Icon, text }, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon
                              size={13}
                              strokeWidth={2}
                              className="text-[#004b9c]"
                            />
                          </div>
                          <span className="text-gray-500 text-[13px] font-normal leading-snug">
                            {text}
                          </span>
                        </div>
                      ))}
                      <div className="pt-1">
                        <Link
                          href="/store-locator"
                          className="inline-flex items-center gap-2 text-[#004b9c] text-[13px] font-bold tracking-wide hover:gap-3 transition-all duration-200"
                        >
                          Get Directions{" "}
                          <ArrowRight size={13} strokeWidth={2.8} />
                        </Link>
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${store.badgeColor}, ${GREEN})`,
                      }}
                    />
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §7  CLOSING CTA — dark blue full bleed
        ════════════════════════════════════════════════════════ */}
        <section
          className="relative w-full overflow-hidden py-24 lg:py-28"
          style={{
            background: `linear-gradient(135deg, ${BLUE} 0%, #001d4a 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
          <div className="absolute top-0 left-0 w-1 h-28 bg-gradient-to-b from-[#81bf42] to-transparent" />

          {/* Giant watermark */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none select-none overflow-hidden">
            <span
              className="font-black uppercase text-white/[0.025] leading-none tracking-widest"
              style={{
                fontSize: "clamp(6rem, 18vw, 16rem)",
              }}
            >
              iSPORTS
            </span>
          </div>

          <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12 text-center">
            <FadeUp delay={0}>
              <div className="inline-flex items-center gap-2.5 mb-6">
                <div className="h-[2px] w-6 rounded-full bg-[#81bf42]" />
                <span className="text-[#81bf42] text-[10.5px] font-semibold tracking-[0.26em] uppercase">
                  Ready to Play
                </span>
                <div className="h-[2px] w-6 rounded-full bg-[#81bf42]" />
              </div>

              <h2
                className="text-white uppercase font-black italic leading-[0.87] tracking-tight mb-7"
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
                }}
              >
                Gear Up With{" "}
                <span
                  className="text-transparent"
                  style={{
                    WebkitTextStroke: `2.5px ${GREEN}`,
                    paintOrder: "stroke fill",
                  }}
                >
                  iSPORTS
                </span>
                <br />
                <span className="text-white">Today.</span>
              </h2>

              <p className="text-white/50 text-[15px] font-normal leading-[1.8] max-w-[460px] mx-auto mb-10">
                Browse 15+ premium brands, order via WhatsApp, and get your gear
                delivered across the UAE — fast, authentic, and completely
                hassle-free.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white text-[13px] font-bold tracking-[0.1em] uppercase bg-[#81bf42] hover:bg-[#6aad2a] shadow-[0_6px_28px_rgba(129,191,66,0.38)] hover:shadow-[0_10px_36px_rgba(129,191,66,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Shop Full Range <ArrowRight size={15} strokeWidth={2.8} />
                </Link>
                <a
                  href="https://wa.me/971526514666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white text-[13px] font-bold tracking-[0.1em] uppercase border-[1.5px] border-white/20 bg-white/08 hover:bg-white/14 hover:border-white/38 hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order via WhatsApp
                </a>
              </div>
            </FadeUp>
          </div>
        </section>
      </main>
    </>
  );
}
