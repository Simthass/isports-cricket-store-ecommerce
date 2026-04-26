"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headphones,
  LucideIcon,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface TrustItemType {
  id: number;
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
}

interface TrustItemProps {
  item: TrustItemType;
  index: number;
  isLast: boolean;
}

// ─── Trust Items ─────────────────────────────────────────────────
const TRUST_ITEMS: TrustItemType[] = [
  {
    id: 1,
    icon: Truck,
    title: "Free Delivery",
    desc: "On all orders over AED 500",
    accent: "#004b9c",
    accentLight: "#e8f0fb",
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "100% protected transactions",
    accent: "#81bf42",
    accentLight: "#eef7e0",
  },
  {
    id: 3,
    icon: RefreshCcw,
    title: "Easy Returns",
    desc: "30-day hassle-free return policy",
    accent: "#004b9c",
    accentLight: "#e8f0fb",
  },
  {
    id: 4,
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated customer care team",
    accent: "#81bf42",
    accentLight: "#eef7e0",
  },
];

// ─── Single Trust Item ────────────────────────────────────────────
function TrustItem({ item, index, isLast }: TrustItemProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.09,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`
        group flex flex-1 items-center gap-4 px-8 py-7
        transition-colors duration-200 hover:bg-white/70
        ${!isLast ? "border-r border-[#004b9c]/08" : ""}
      `}
    >
      {/* Icon circle */}
      <div
        className="
          relative flex-shrink-0 w-14 h-14 rounded-2xl
          flex items-center justify-center
          transition-all duration-300
          group-hover:scale-105 group-hover:shadow-lg
        "
        style={{
          background: item.accentLight,
          boxShadow: `0 4px 16px ${item.accent}18`,
        }}
      >
        {/* Animated top-left corner accent dot */}
        <div
          className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: item.accent }}
        />
        <Icon
          size={24}
          strokeWidth={1.6}
          style={{ color: item.accent }}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="text-gray-900 font-bold text-[14.5px] leading-tight tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {item.title}
        </span>
        <span
          className="text-gray-400 text-[12.5px] font-normal leading-snug"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {item.desc}
        </span>
        {/* Animated underline on hover */}
        <div
          className="h-[2px] w-0 group-hover:w-full rounded-full mt-1 transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, ${item.accent}, ${item.accent}00)`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function TrustStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ── Top rule ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#004b9c]/15 to-transparent" />

      {/* ── Main strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="
          relative bg-[#f8faff]
          border-y border-[#004b9c]/07
        "
      >
        {/* Dot texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none [background-image:radial-gradient(circle,#004b9c12_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Left & right brand accent lines */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-[#004b9c] to-[#81bf42]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-l-full bg-gradient-to-b from-[#81bf42] to-[#004b9c]" />

        {/* ── Grid of trust items ── */}
        <div className="relative max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 divide-[#004b9c]/07">
            {TRUST_ITEMS.map((item, i) => (
              <TrustItem
                key={item.id}
                item={item}
                index={i}
                isLast={i === TRUST_ITEMS.length - 1}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Bottom rule ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#81bf42]/20 to-transparent" />
    </section>
  );
}
