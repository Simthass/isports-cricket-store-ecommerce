"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, MoveRight } from "lucide-react";

// ─── Brand Palette (Tailwind HEX) ───────────────────────────────
const BLUE = "#004b9c";
const GREEN = "#81bf42";

// ─── Categories Data ────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "balls",
    name: "Balls",
    slug: "/category/balls",
    icon: "/Categories/cricket-ball.png",
    count: "40+ Products",
    accent: "#81bf42",
    accentLight: "#eef7e0",
    desc: "Red, white & pink",
  },
  {
    id: "helmets",
    name: "Helmets",
    slug: "/category/helmets",
    icon: "/Categories/helmet.png",
    count: "30+ Products",
    accent: "#004b9c",
    accentLight: "#e8f0fb",
    desc: "ICC certified",
  },
  {
    id: "bats",
    name: "Bats",
    slug: "/category/bats",
    icon: "/Categories/bat.png",
    count: "200+ Products",
    accent: "#81bf42",
    accentLight: "#eef7e0",
    desc: "English & Kashmir willow",
  },
  {
    id: "clothing",
    name: "Clothing",
    slug: "/category/clothing",
    icon: "/Categories/tshirt.png",
    count: "80+ Products",
    accent: "#004b9c",
    accentLight: "#e8f0fb",
    desc: "Jerseys & training kits",
  },
  {
    id: "shoes",
    name: "Shoes",
    slug: "/category/shoes",
    icon: "/Categories/sneakers.png",
    count: "60+ Products",
    accent: "#81bf42",
    accentLight: "#eef7e0",
    desc: "Spikes & turf shoes",
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "/category/accessories",
    icon: "/Categories/game.png",
    count: "100+ Products",
    accent: "#81bf42",
    accentLight: "#eef7e0",
    desc: "Gloves, pads & more",
  },
];

function CategoryCard({ cat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className="w-full"
    >
      <Link
        href={cat.slug}
        className="group block relative perspective-1000"
        aria-label={cat.name}
      >
        <div
          className="relative bg-white rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center px-4 py-9 gap-5
                     border border-slate-100 transition-all duration-500 font-poppins
                     shadow-[0_2px_12px_rgba(0,75,156,0.06),0_0_0_1px_rgba(0,75,156,0.05)]
                     hover:shadow-[0_20px_40px_rgba(0,75,156,0.12),0_0_0_1.5px_rgba(0,75,156,0.1)]
                     hover:-translate-y-1.5"
        >
          {/* Hover Fill Background */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(145deg, ${cat.accentLight} 0%, #ffffff 100%)`,
            }}
          />

          {/* Top Decorative Rule */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[4px] w-0 group-hover:w-full transition-all duration-500 ease-out"
            style={{ backgroundColor: cat.accent }}
          />

          {/* Icon Container */}
          <div className="relative z-10">
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                backgroundColor: cat.accentLight,
                boxShadow: `0 0 0 1px ${cat.accent}20`,
              }}
            >
              {/* Outer Animated Ring */}
              <div
                className="absolute inset-[-6px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
                style={{ border: `1.5px dashed ${cat.accent}40` }}
              />

              <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-110">
                <Image
                  src={cat.icon}
                  alt={cat.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Typography Container */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight transition-colors duration-300">
              {cat.name}
            </h3>
            <p
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: `${cat.accent}cc` }}
            >
              {cat.desc}
            </p>
          </div>

          {/* Hover State: Reveal Count Chip */}
          <div
            className="absolute bottom-6 z-20 flex items-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 px-4 py-1.5 rounded-full shadow-lg"
            style={{ backgroundColor: cat.accent }}
          >
            <span className="text-white text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
              {cat.count}
            </span>
            <ArrowRight size={12} strokeWidth={3} className="text-white" />
          </div>

          {/* Static State: Display Count */}
          <div className="relative z-10 group-hover:opacity-0 transition-opacity duration-200">
            <span className="text-[11px] font-semibold text-slate-400">
              {cat.count}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection() {
  const headRef = useRef(null);
  const headView = useInView(headRef, { once: true, margin: "-40px" });

  return (
    <section className="relative w-full bg-white overflow-hidden py-20 lg:py-28 font-poppins">
      {/* Background Dot Texture - Using inline style for the pattern, Tailwind for visibility */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, ${BLUE} 1.2px, transparent 1.2px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Decorative Blur Orbs */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[80px] pointer-events-none"
        style={{ background: `${GREEN}15` }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[80px] pointer-events-none"
        style={{ background: `${BLUE}10` }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-16"
        >
          {/* Eyebrow Label */}
          <div className="flex items-center gap-2 bg-[#e8f0fb] border border-[#004b9c15] text-[#004b9c] px-4 py-1.5 rounded-full mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: GREEN }}
            />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              Browse Collection
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight uppercase italic">
            Explore Our{" "}
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: `1.5px ${BLUE}` }}
            >
              Categories
            </span>
          </h2>

          {/* Animated Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#004b9c30]" />
            <div
              className="w-2 h-2 rounded-full rotate-45"
              style={{ backgroundColor: GREEN }}
            />
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#004b9c30]" />
          </div>

          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
            Discover professional-grade cricket gear tailored for performance.
            From elite willow bats to safety-tested protective equipment.
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center mt-16 gap-6"
        >
          <Link
            href="/shop"
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-xs tracking-[0.1em] uppercase overflow-hidden transition-all duration-300 
                       bg-gradient-to-br from-[#004b9c] to-[#0062cc] 
                       shadow-[0_10px_25px_-5px_rgba(0,75,156,0.4)]
                       hover:shadow-[0_15px_30px_-5px_rgba(0,75,156,0.5)] 
                       hover:-translate-y-1 active:translate-y-0"
          >
            <span>View All Products</span>
            <MoveRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Brand List Hint */}
          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-slate-300 text-center">
            Authorized Dealer for: Gray-Nicolls • SS • Kookaburra • MRF • Shrey
            • GM • Adidas
          </p>
        </motion.div>
      </div>

      {/* Section Bottom Border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)`,
        }}
      />
    </section>
  );
}
