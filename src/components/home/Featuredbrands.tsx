"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const BRANDS = [
  {
    id: 1,
    name: "Adidas",
    logo: "/brands/adidas.png",
    href: "/brand/adidas",
  },
  {
    id: 2,
    name: "Nike",
    logo: "/brands/nike.png",
    href: "/brand/nike",
  },
  {
    id: 3,
    name: "Puma",
    logo: "/brands/puma.png",
    href: "/brand/puma",
  },
  {
    id: 4,
    name: "MoonWalkr",
    logo: "/brands/moonwalkr.png",
    href: "/brand/moonwalkr",
  },
  {
    id: 5,
    name: "Shrey",
    logo: "/brands/shrey.png",
    href: "/brand/shrey",
  },
  {
    id: 6,
    name: "New Balance",
    logo: "/brands/newBalance.png",
    href: "/brand/new-balance",
  },
  {
    id: 7,
    name: "Gray-Nicolls",
    logo: "/brands/grayNicolls.png",
    href: "/brand/gray-nicolls",
  },
  {
    id: 8,
    name: "Kookaburra",
    logo: "/brands/kookaburra.png",
    href: "/brand/kookaburra",
  },
  {
    id: 9,
    name: "MRF",
    logo: "/brands/MRF.png",
    href: "/brand/mrf",
  },
  {
    id: 10,
    name: "SS Sports",
    logo: "/brands/SS.png",
    href: "/brand/ss-sports",
  },
  {
    id: 11,
    name: "SG Cricket",
    logo: "/brands/SG.png",
    href: "/brand/sg-cricket",
  },
  {
    id: 12,
    name: "CA Sports",
    logo: "/brands/CA.png",
    href: "/brand/ca-sports",
  },
];

// Triple the brands so the marquee never gaps
const MARQUEE_BRANDS = [...BRANDS, ...BRANDS, ...BRANDS];

// ─── Single Brand Card ────────────────────────────────────────────
function BrandCard({ brand }) {
  return (
    <Link href={brand.href} className="group flex-shrink-0">
      <div
        className="
          relative flex items-center justify-center
          w-[175px] h-[100px] rounded-2xl mx-2.5
          bg-white border border-[#004b9c]/08
          shadow-[0_2px_12px_rgba(0,75,156,0.06)]
          transition-all duration-300 ease-out
          group-hover:-translate-y-1.5
          group-hover:shadow-[0_12px_36px_rgba(0,75,156,0.13)]
          group-hover:border-[#004b9c]/20
          overflow-hidden
        "
      >
        {/* Hover fill tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f0fb]/0 to-[#eef7e0]/0 group-hover:from-[#e8f0fb]/60 group-hover:to-[#eef7e0]/40 transition-all duration-300 rounded-2xl" />

        {/* Top accent rule — grows on hover */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] w-0 group-hover:w-full bg-gradient-to-r from-[#004b9c] to-[#81bf42] rounded-b-full transition-all duration-500 pointer-events-none" />

        {/* Logo */}
        <div className="relative w-[120px] h-[56px] transition-all duration-300 group-hover:scale-105">
          <Image
            src={brand.logo}
            alt={brand.name}
            fill
            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-400"
            sizes="120px"
          />
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function FeaturedBrands() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <>
      <style>{`
        @keyframes brand-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-brand-marquee {
          animation: brand-marquee 32s linear infinite;
        }
        .animate-brand-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section
        ref={ref}
        className="relative w-full bg-white overflow-hidden py-16 lg:py-24"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* ── Dot texture bg ── */}
        <div className="absolute inset-0 opacity-40 pointer-events-none [background-image:radial-gradient(circle,#004b9c12_1.2px,transparent_1.2px)] [background-size:28px_28px]" />

        {/* ── Ambient blobs ── */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#81bf42]/08 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#004b9c]/06 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

        {/* ── Watermark BRANDS text behind headline ── */}
        <div className="absolute inset-x-0 top-6 flex justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="text-[clamp(5rem,14vw,11rem)] font-black uppercase tracking-widest text-[#004b9c]/[0.04] leading-none"
            aria-hidden="true"
          >
            BRANDS
          </span>
        </div>

        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12">
          {/* ── Section Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.48 }}
            className="flex flex-col items-center text-center gap-4 mb-14"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#e8f0fb] border border-[#004b9c]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#81bf42]" />
              <span className="text-[#004b9c] text-[10.5px] font-semibold tracking-[0.22em] uppercase">
                Trusted Partners
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-black uppercase leading-tight tracking-tight text-gray-900 text-[clamp(2rem,4.5vw,3.2rem)]">
              Featured{" "}
              <span className="text-transparent [-webkit-text-stroke:2px_#004b9c] [paint-order:stroke_fill]">
                Brands
              </span>
            </h2>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#81bf42]/60" />
              <div className="w-2 h-2 rounded-full bg-[#81bf42]" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#81bf42]/60" />
            </div>

            <p className="text-gray-400 text-[14px] font-normal leading-relaxed max-w-[420px] tracking-wide">
              Discover our curated collection of premium cricket sports brands
              trusted by professionals across the UAE.
            </p>
          </motion.div>
        </div>

        {/* ── Marquee Track ── */}
        {/*
          Edge fade masks using Tailwind arbitrary gradient values.
          The track itself overflows the container intentionally.
        */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Left fade mask */}
          <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-40 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          {/* Right fade mask */}
          <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

          {/* Scrolling strip */}
          <div className="flex overflow-hidden py-4">
            <div className="animate-brand-marquee flex items-center will-change-transform">
              {MARQUEE_BRANDS.map((brand, idx) => (
                <BrandCard key={`${brand.id}-${idx}`} brand={brand} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
