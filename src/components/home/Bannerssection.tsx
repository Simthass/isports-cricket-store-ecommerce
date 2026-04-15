"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface BannerType {
  id: number;
  eyebrow: string;
  title: string[];
  cta: { label: string; href: string };
  image: string;
  imageAlt: string;
  imageSide: string;
  overlayFrom: string;
  overlayTo: string;
  textColor: string;
  eyebrowColor: string;
  bgFallback: string;
}

interface BannerProps {
  banner: BannerType;
  index: number;
}

// ─── Banner Data ────────────────────────────────────────────────
// Replace `image` with your actual image paths in /public/banners/
const BANNERS: BannerType[] = [
  {
    id: 1,
    eyebrow: "Special Edition",
    title: ["New Season", "Cricket", "Shoes 2026"],
    cta: { label: "Shop Now", href: "/shop?category=shoes" },
    image: "/banner1.jpg", // ← your image path
    imageAlt: "Cricket Shoes 2026 Collection",
    imageSide: "left",
    overlayFrom: "from-transparent",
    overlayTo: "to-[#004b9c]/80",
    textColor: "text-white",
    eyebrowColor: "text-[#81bf42]",
    bgFallback: "bg-[#dbeafe]",
  },
  {
    id: 2,
    eyebrow: "Best Quality",
    title: ["Premium", "Cricket", "Balls"],
    cta: { label: "Shop Now", href: "/shop?category=balls" },
    image: "/banner2.png", // ← your image path
    imageAlt: "Premium Cricket balls",
    imageSide: "left",
    overlayFrom: "from-transparent",
    overlayTo: "to-[#1a3a1a]/75",
    textColor: "text-white",
    eyebrowColor: "text-[#81bf42]",
    bgFallback: "bg-[#f0fdf4]",
  },
];

// ─── Single Banner ───────────────────────────────────────────────
function Banner({ banner, index }: BannerProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex-1 min-w-0"
    >
      <Link href={banner.cta.href} className="group block">
        <div className="relative rounded-2xl overflow-hidden h-[300px] lg:h-[340px] shadow-sm group-hover:shadow-xl transition-shadow duration-500">
          {/* ── Background Image ── */}
          <Image
            src={banner.image}
            alt={banner.imageAlt}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />

          {/* ── Gradient Overlay (left-to-right, image side is clear, text side is dark) ── */}
          <div
            className={`absolute inset-0 bg-gradient-to-l ${banner.overlayFrom} ${banner.overlayTo}`}
          />

          {/* ── Additional soft vignette for depth ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* ── Blue top-left corner accent ── */}
          <div className="absolute top-0 left-0 w-1 h-16 bg-[#81bf42] rounded-br-full opacity-80" />

          {/* ── Content block (right-aligned text) ── */}
          <div className="absolute inset-0 flex flex-col justify-center items-end pr-8 pl-4 md:pr-10">
            <div className="flex flex-col gap-3 max-w-[240px] text-right">
              {/* Eyebrow label */}
              <motion.span
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.12 + 0.2 }}
                className={`text-[10.5px] font-bold tracking-[0.28em] uppercase ${banner.eyebrowColor}`}
              >
                {banner.eyebrow}
              </motion.span>

              {/* Main title */}
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.12 + 0.28 }}
                className={`leading-[0.9] tracking-tight font-black italic uppercase ${banner.textColor}`}
                style={{
                  fontSize: "clamp(1.85rem, 3.2vw, 2.65rem)",
                }}
              >
                {banner.title.map((line, i) => (
                  <span key={i} className="block">
                    {i === 0 ? (
                      <span className="text-white">{line}</span>
                    ) : i === 1 ? (
                      <span
                        className="text-transparent"
                        style={{
                          WebkitTextStroke: "2px #004b9c",
                          paintOrder: "stroke fill",
                        }}
                      >
                        {line}
                      </span>
                    ) : (
                      <span className="text-white">{line}</span>
                    )}
                  </span>
                ))}
              </motion.h2>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.12 + 0.38 }}
                className="flex justify-end mt-1"
              >
                <span
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                             text-white text-[11.5px] font-black tracking-[0.12em] uppercase
                             bg-[#004b9c] shadow-lg
                             group-hover:bg-[#81bf42] group-hover:shadow-[0_6px_24px_rgba(129,191,66,0.45)]
                             transition-all duration-300"
                >
                  {banner.cta.label}
                  <ArrowRight
                    size={13}
                    strokeWidth={2.8}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </span>
              </motion.div>
            </div>
          </div>

          {/* ── Hover border glow ring ── */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-transparent
                       group-hover:border-[#81bf42]/40 transition-colors duration-400 pointer-events-none"
          />

          {/* ── Bottom-left product count chip ── */}
          <div
            className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5
                       rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#81bf42] animate-pulse" />
            <span className="text-white text-[10px] font-bold tracking-wider uppercase">
              In Stock · UAE
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function BannersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      ref={ref}
      className="relative w-full bg-white py-8 lg:py-12 overflow-hidden"
    >
      {/* Faint dot grid background - inline bg only, Tailwind arbitrary value */}
      <div className="absolute inset-0 opacity-40 pointer-events-none [background-image:radial-gradient(circle,#004b9c14_1.2px,transparent_1.2px)] [background-size:28px_28px]" />

      <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12">
        {/* ── Section Label ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="h-[3px] w-8 rounded-full bg-[#81bf42]" />
          <span className="text-[10.5px] font-bold tracking-[0.26em] uppercase text-[#81bf42]">
            Featured Collections
          </span>
        </motion.div>

        {/* ── Two Banners Row ── */}
        <div className="flex flex-col lg:flex-row gap-5">
          {BANNERS.map((banner, i) => (
            <Banner key={banner.id} banner={banner} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
