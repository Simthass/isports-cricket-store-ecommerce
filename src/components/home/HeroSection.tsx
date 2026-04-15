// src/components/home/HeroSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Star,
  ChevronLeft,
  Loader2,
} from "lucide-react";

interface HeroProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  categoryId: { name: string; slug: string };
  brandId: { name: string; slug: string; logo?: string };
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  heroOrder?: number;
}

interface StaticSlide {
  id: number;
  eyebrow: string;
  tag: string;
  headline: string[];
  sub: string;
  cta: { label: string; href: string };
  sec: {
    label: string;
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  };
  badge: { icon: React.ElementType; text: string };
  stats: Array<{ value: string; label: string }>;
}

const BLUE = "#004b9c";
const GREEN = "#81bf42";
const BLUE_MID = "#003d82";

function savePct(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100);
}

// Static slide content for left side
const STATIC_SLIDES: StaticSlide[] = [
  {
    id: 0,
    eyebrow: "New Season 2026",
    tag: "BATS · HELMETS · CLOTHING · SHOES",
    headline: ["Professional", "Cricket Gear"],
    sub: "Premium equipment trusted by 1,000+ players across the UAE. Same-day delivery in Sharjah & Ajman.",
    cta: { label: "Shop New Arrivals", href: "/shop" },
    sec: { label: "View All Brands", href: "/#brands" },
    badge: { icon: Zap, text: "Same-Day Delivery" },
    stats: [
      { value: "15+", label: "Elite Brands" },
      { value: "1,000+", label: "Players" },
      { value: "AED 0", label: "COD Fee" },
    ],
  },
  {
    id: 1,
    eyebrow: "Exclusive Collection",
    tag: "ENGLISH WILLOW · KASHMIR WILLOW",
    headline: ["Elite Batting", "Equipment"],
    sub: "From Gray-Nicolls to SS — Grade 1 English Willow blades engineered to elevate your game.",
    cta: { label: "Explore Bats", href: "/shop?category=cricket-bats" },
    sec: { label: "Order via WhatsApp", href: "https://wa.me/971526514666" },
    badge: { icon: Shield, text: "Authenticity Guaranteed" },
    stats: [
      { value: "200+", label: "Bat Models" },
      { value: "24 hr", label: "UAE Shipping" },
      { value: "15+", label: "Brands" },
    ],
  },
  {
    id: 2,
    eyebrow: "Protection First",
    tag: "SHREY · MOONWALKR · DSC",
    headline: ["ICC-Certified", "Helmets"],
    sub: "Cutting-edge Stem Guard technology. Safety meets premium design for the modern UAE cricketer.",
    cta: { label: "Shop Helmets", href: "/shop?category=helmets" },
    sec: {
      label: "Find a Store",
      href: "/about#visit-our-stores",
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (window.location.pathname === "/about") {
          const storesSection = document.getElementById("visit-our-stores");
          if (storesSection) {
            storesSection.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          sessionStorage.setItem("scrollToStores", "true");
          window.location.href = "/about";
        }
      },
    },
    badge: { icon: Star, text: "ICC Certified" },
    stats: [
      { value: "50+", label: "Helmet Models" },
      { value: "3", label: "Locations" },
      { value: "100%", label: "ICC Certified" },
    ],
  },
];

export default function HeroSection() {
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const [direction, setDir] = useState<number>(1);

  useEffect(() => {
    const fetchHeroProducts = async () => {
      try {
        const res = await fetch("/api/home/hero");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setProducts(json.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching hero products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroProducts();
  }, []);

  useEffect(() => {
    if (paused || products.length === 0) return;
    const t = setInterval(() => {
      setDir(1);
      setActive((p) => (p + 1) % products.length);
    }, 5800);
    return () => clearInterval(t);
  }, [paused, products.length]);

  const goTo = (idx: number): void => {
    if (idx === active || products.length === 0) return;
    setDir(idx > active ? 1 : -1);
    setActive(idx);
    setPaused(true);
    setTimeout(() => setPaused(false), 9000);
  };

  const staticSlide = STATIC_SLIDES[active % STATIC_SLIDES.length];
  const currentProduct = products[active];

  const txtV: Variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: (d: number) => ({
      x: d > 0 ? -30 : 30,
      opacity: 0,
      transition: { duration: 0.3 },
    }),
  };

  const cardV: Variants = {
    enter: { opacity: 0, y: 40, scale: 0.95 },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 0.1 },
    },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-173px)] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-white font-['Poppins'] selection:bg-blue-100 mt-6"
      style={{ minHeight: "calc(100vh - 173px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Textures */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, ${BLUE}20 1.3px, transparent 1.3px)`,
          backgroundSize: "26px 26px",
        }}
      />

      {/* Blue Right Panel - Desktop only */}
      <div
        className="absolute top-0 right-0 bottom-0 pointer-events-none hidden lg:block"
        style={{
          width: "46%",
          background: `linear-gradient(150deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
          clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      <div
        className="absolute top-0 right-0 bottom-0 pointer-events-none hidden lg:block"
        style={{
          width: "46%",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Floating Animated Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20px] right-[6%] hidden lg:block"
      >
        <svg
          width={240}
          height={240}
          viewBox="0 0 120 120"
          className="opacity-10"
        >
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
          <path
            d="M22 60 C32 38 54 32 60 18 C66 32 88 38 98 60 C88 82 66 88 60 102 C54 88 32 82 22 60Z"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>
      </motion.div>

      {/* Content Grid */}
      <div className="relative max-w-[1400px] mx-auto px-5 lg:px-16 z-10">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={txtV}
              initial="enter"
              animate="center"
              exit="exit"
              className="py-6"
            >
              {/* Tag Line */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-1 w-8 rounded-full"
                  style={{ background: GREEN }}
                />
                <span
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: GREEN }}
                >
                  {staticSlide.tag}
                </span>
              </div>

              {/* Eyebrow Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#e8f0fb] border border-[#004b9c15] text-[#004b9c]">
                  <staticSlide.badge.icon size={11} strokeWidth={2.5} />
                  {staticSlide.eyebrow}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[32px] font-black leading-[1.1] tracking-tight uppercase italic mb-4">
                <span className="block text-slate-900">
                  {staticSlide.headline[0]}
                </span>
                <span
                  className="block"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `1.5px ${BLUE}`,
                  }}
                >
                  {staticSlide.headline[1]}
                </span>
              </h1>

              {/* Description */}
              <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                {staticSlide.sub}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href={staticSlide.cta.href}
                  className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#004b9c] to-[#0062cc] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  {staticSlide.cta.label}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                {staticSlide.sec.onClick ? (
                  <a
                    href={staticSlide.sec.href}
                    onClick={staticSlide.sec.onClick}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#004b9c] text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {staticSlide.sec.label}
                  </a>
                ) : (
                  <Link
                    href={staticSlide.sec.href}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#004b9c] text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {staticSlide.sec.label}
                  </Link>
                )}
              </div>

              {/* Product Card - Dynamic from DB */}
              {currentProduct && (
                <div className="mt-6 mb-8">
                  <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg">
                    <div className="absolute top-3 left-3 z-20">
                      <span
                        className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-md"
                        style={{
                          background: currentProduct.isBestSeller
                            ? GREEN
                            : BLUE,
                        }}
                      >
                        {currentProduct.isBestSeller
                          ? "Best Seller"
                          : currentProduct.isNewArrival
                            ? "New"
                            : "Featured"}
                      </span>
                    </div>
                    {currentProduct.originalPrice &&
                      currentProduct.originalPrice > currentProduct.price && (
                        <div className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex flex-col items-center justify-center bg-[#81bf4215] backdrop-blur-sm border border-[#81bf4230]">
                          <span className="text-[6px] font-black text-[#81bf42]">
                            SAVE
                          </span>
                          <span className="text-[8px] font-black text-[#81bf42]">
                            {savePct(
                              currentProduct.price,
                              currentProduct.originalPrice,
                            )}
                            %
                          </span>
                        </div>
                      )}

                    <div className="relative h-[180px] w-full bg-gradient-to-br from-[#e8f0fb] via-white to-[#eef7e0]">
                      {currentProduct.images?.[0] && (
                        <Image
                          src={currentProduct.images[0]}
                          alt={currentProduct.name}
                          fill
                          className="object-contain p-4"
                          priority
                        />
                      )}
                    </div>

                    <div className="p-4">
                      <p
                        className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                        style={{ color: GREEN }}
                      >
                        {currentProduct.categoryId?.name}
                      </p>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-3 line-clamp-2">
                        {currentProduct.name}
                      </h3>

                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-[#004b9c]">
                            AED {currentProduct.price.toLocaleString()}
                          </span>
                          {currentProduct.originalPrice &&
                            currentProduct.originalPrice >
                              currentProduct.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                AED{" "}
                                {currentProduct.originalPrice.toLocaleString()}
                              </span>
                            )}
                        </div>
                        <Link
                          href={`/shop/product/${currentProduct.slug}`}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[#004b9c] hover:bg-[#004b9c] hover:text-white transition-all"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {["COD", "Apple Pay", "Tabby"].map((method) => (
                          <span
                            key={method}
                            className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[7px] font-bold uppercase tracking-widest text-slate-500"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Row */}
              <div className="mb-12">
                <div className="grid grid-cols-3 gap-4 py-4 px-2 bg-gradient-to-r from-blue-50/50 to-green-50/50 rounded-2xl border border-blue-100/50">
                  {staticSlide.stats.map((stat, idx: number) => (
                    <div key={idx} className="text-center">
                      <p className="text-xl font-black text-[#004b9c] mb-1">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500 leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Layout */}
        <div
          className="hidden lg:grid lg:grid-cols-2 items-center gap-12"
          style={{
            minHeight: "calc(100vh - 220px)",
            paddingTop: "60px",
            paddingBottom: "100px",
          }}
        >
          {/* LEFT CONTENT - Static */}
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
                    {staticSlide.tag}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-full bg-[#e8f0fb] border border-[#004b9c15] text-[#004b9c]">
                    <staticSlide.badge.icon size={12} strokeWidth={2.5} />
                    {staticSlide.eyebrow}
                  </span>
                </div>

                <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight uppercase italic mb-8">
                  <span className="block text-slate-900">
                    {staticSlide.headline[0]}
                  </span>
                  <span
                    className="block"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: `2px ${BLUE}`,
                    }}
                  >
                    {staticSlide.headline[1]}
                  </span>
                </h1>

                <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg mb-10 font-medium">
                  {staticSlide.sub}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-12">
                  <Link
                    href={staticSlide.cta.href}
                    className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-[#004b9c] to-[#0062cc] text-white text-sm font-bold uppercase tracking-widest shadow-[0_10px_30px_-10px_#004b9c] hover:shadow-[0_15px_40px_-10px_#004b9c] transition-all hover:-translate-y-0.5"
                  >
                    {staticSlide.cta.label}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                  {staticSlide.sec.onClick ? (
                    <a
                      href={staticSlide.sec.href}
                      onClick={staticSlide.sec.onClick}
                      className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#004b9c] text-sm font-bold uppercase tracking-widest hover:bg-slate-50 hover:border-[#004b9c30] transition-all"
                    >
                      {staticSlide.sec.label}
                    </a>
                  ) : (
                    <Link
                      href={staticSlide.sec.href}
                      className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#004b9c] text-sm font-bold uppercase tracking-widest hover:bg-slate-50 hover:border-[#004b9c30] transition-all"
                    >
                      {staticSlide.sec.label}
                    </Link>
                  )}
                </div>

                <div className="inline-flex bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-2">
                  {staticSlide.stats.map((s, idx: number) => (
                    <div
                      key={idx}
                      className={`flex flex-col px-8 py-3 ${idx !== staticSlide.stats.length - 1 ? "border-r border-slate-100" : ""}`}
                    >
                      <span
                        className="text-3xl font-black text-slate-900 leading-none mb-1"
                        style={{ color: idx === 1 ? GREEN : BLUE }}
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

          {/* RIGHT CARD - Dynamic from DB */}
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
                  <div className="absolute top-6 left-6 z-20">
                    <span
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                      style={{
                        background: currentProduct?.isBestSeller ? GREEN : BLUE,
                      }}
                    >
                      {currentProduct?.isBestSeller
                        ? "Best Seller"
                        : currentProduct?.isNewArrival
                          ? "New"
                          : "Featured"}
                    </span>
                  </div>

                  {currentProduct?.originalPrice &&
                    currentProduct.originalPrice > currentProduct.price && (
                      <div className="absolute top-6 right-6 z-20 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 border-[#81bf4240] bg-[#81bf4210] backdrop-blur-md">
                        <span className="text-[8px] font-black text-[#81bf42]">
                          SAVE
                        </span>
                        <span className="text-xs font-black text-[#81bf42]">
                          {savePct(
                            currentProduct.price,
                            currentProduct.originalPrice,
                          )}
                          %
                        </span>
                      </div>
                    )}

                  <div className="relative h-[320px] w-full flex items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-[#e8f0fb] via-white to-[#eef7e0]">
                    {currentProduct?.images?.[0] && (
                      <Image
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        fill
                        className="object-contain drop-shadow-2xl p-8 scale-110 group-hover:scale-125 transition-transform duration-700"
                        priority
                      />
                    )}
                  </div>

                  <div className="p-8">
                    <p
                      className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                      style={{ color: GREEN }}
                    >
                      {currentProduct?.categoryId?.name}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-6 italic">
                      {currentProduct?.name}
                    </h3>

                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-[#004b9c]">
                          AED {currentProduct?.price.toLocaleString()}
                        </span>
                        {currentProduct?.originalPrice &&
                          currentProduct.originalPrice >
                            currentProduct.price && (
                            <span className="text-sm text-slate-400 line-through font-medium">
                              AED{" "}
                              {currentProduct.originalPrice.toLocaleString()}
                            </span>
                          )}
                      </div>
                      <Link
                        href={`/shop/product/${currentProduct?.slug}`}
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={() =>
              goTo((active - 1 + products.length) % products.length)
            }
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#004b9c] transition-all hover:scale-110 active:scale-95 hidden lg:flex border border-slate-100"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => goTo((active + 1) % products.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#004b9c] shadow-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 hidden lg:flex"
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {products.length > 1 && (
        <div className="absolute bottom-16 left-6 lg:left-16 flex items-center gap-4 z-20">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="group relative h-1.5 transition-all duration-500 rounded-full bg-slate-100 overflow-hidden hidden lg:block"
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
          <span className="text-xs font-bold tracking-widest text-[#004b9c40] ml-2 hidden lg:inline">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(products.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Brand Ticker */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex items-center overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex items-center whitespace-nowrap"
        >
          {[
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
            "Gray-Nicolls",
            "SS Sports",
            "SG Cricket",
            "Kookaburra",
            "GM Cricket",
          ].map((brand, idx) => (
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
