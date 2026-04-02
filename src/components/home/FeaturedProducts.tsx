"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Star,
  TrendingUp,
  ArrowRight,
  Check,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react";

// --- Products Data ---
const PRODUCTS = [
  {
    id: 1,
    name: "Indian Cricket Jersey",
    brand: "Adidas",
    image: "/Products/P1.jpg",
    price: 90,
    originalPrice: 120,
    priceMin: 40,
    priceMax: 90,
    hasRange: true,
    rating: 5,
    reviews: 128,
    badge: "Hot",
    badgeColor: "bg-red-600",
    inStock: true,
    isNew: false,
  },
  {
    id: 2,
    name: "Adidas 22YDS Cricket Metal Spike Shoes",
    brand: "Adidas",
    image: "/products/P2.png",
    price: 525,
    originalPrice: 620,
    priceMin: 499,
    priceMax: 525,
    hasRange: true,
    rating: 5,
    reviews: 86,
    badge: "New",
    badgeColor: "bg-[#004b9c]",
    inStock: true,
    isNew: true,
  },
  {
    id: 3,
    name: "ADIDAS Batting Gloves Mumbai Indians",
    brand: "Adidas",
    image: "/products/P3.png",
    price: 275,
    originalPrice: 320,
    hasRange: false,
    rating: 5,
    reviews: 54,
    badge: "Best Seller",
    badgeColor: "bg-[#81bf42]",
    inStock: true,
    isNew: false,
  },
  {
    id: 4,
    name: "Adidas Cricket Incurza 4.0 Willow Bat – SH",
    brand: "Adidas",
    image: "/products/P4.jpg",
    price: 250,
    originalPrice: 310,
    hasRange: false,
    rating: 4,
    reviews: 97,
    badge: null,
    inStock: true,
    isNew: false,
  },
  {
    id: 5,
    name: "CA Super League Red Cricket Leather Ball",
    brand: "CA Sports",
    image: "/products/P5.png",
    price: 260,
    originalPrice: 300,
    hasRange: false,
    rating: 5,
    reviews: 210,
    badge: "Top Rated",
    badgeColor: "bg-[#81bf42]",
    inStock: true,
    isNew: false,
  },
  {
    id: 6,
    name: "Gray-Nicolls Omega XRD English Willow Bat",
    brand: "Gray-Nicolls",
    image: "/products/P6.jpg",
    price: 2199,
    originalPrice: 2800,
    hasRange: false,
    rating: 5,
    reviews: 43,
    badge: "Premium",
    badgeColor: "bg-[#004b9c]",
    inStock: true,
    isNew: false,
  },
  {
    id: 7,
    name: "Shrey Masterclass Air 2.0 Helmet",
    brand: "Shrey",
    image: "/products/P7.jpg",
    price: 899,
    originalPrice: 1100,
    hasRange: false,
    rating: 5,
    reviews: 72,
    badge: "ICC Certified",
    badgeColor: "bg-[#004b9c]",
    inStock: true,
    isNew: false,
  },
  {
    id: 8,
    name: "MRF Genius Grand Edition Cricket Bat",
    brand: "MRF",
    image: "/products/P8.jpg",
    price: 1299,
    originalPrice: 1650,
    hasRange: false,
    rating: 5,
    reviews: 155,
    badge: "Fan Favourite",
    badgeColor: "bg-red-600",
    inStock: true,
    isNew: false,
  },
  {
    id: 9,
    name: "Kookaburra Pace Cricket Ball",
    brand: "Kookaburra",
    image: "/products/P9.jpg",
    price: 185,
    originalPrice: 220,
    hasRange: false,
    rating: 4,
    reviews: 190,
    badge: null,
    inStock: true,
    isNew: false,
  },
  {
    id: 10,
    name: "SS Ton Reserve Edition Batting Pads",
    brand: "SS Sports",
    image: "/products/P10.jpg",
    price: 349,
    originalPrice: 420,
    hasRange: false,
    rating: 4,
    reviews: 61,
    badge: "Sale",
    badgeColor: "bg-red-600",
    inStock: true,
    isNew: false,
  },
];

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          strokeWidth={0}
          fill={s <= rating ? "#ffd700" : "#e2e8f0"}
          className="transition-colors duration-200"
        />
      ))}
    </div>
  );
}

function ProductCard({ product, index }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const priceDisplay = product.hasRange
    ? `AED ${product.priceMin} – ${product.priceMax}`
    : `AED ${product.price.toLocaleString()}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
      className="h-full"
    >
      <Link href={`/product/${product.id}`} className="group block h-full">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`relative flex flex-col h-full bg-white rounded-3xl transition-all duration-500 overflow-hidden border border-gray-100 ${
            hovered
              ? "shadow-2xl shadow-blue-900/10 -translate-y-2 border-blue-100"
              : "shadow-sm"
          }`}
        >
          {/* Image Area */}
          <div className="relative aspect-square w-full bg-white p-6 overflow-hidden">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {discount > 0 && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  -{discount}%
                </div>
              )}
            </div>

            {product.badge && (
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                  {product.badge === "Hot" && (
                    <Flame size={12} className="text-red-500" />
                  )}
                  {product.badge === "New" && (
                    <Sparkles size={12} className="text-blue-500" />
                  )}
                  {product.badge === "Best Seller" && (
                    <Zap size={12} className="text-green-500" />
                  )}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider text-gray-700`}
                  >
                    {product.badge}
                  </span>
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ scale: hovered ? 1.1 : 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </motion.div>
            </div>

            {/* Quick Add Overlay */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/80 to-transparent"
                >
                  <button
                    onClick={handleCart}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-bold tracking-wide uppercase transition-all duration-300 shadow-lg ${
                      added ? "bg-[#81bf42]" : "bg-[#004b9c] hover:bg-[#003d7e]"
                    }`}
                  >
                    {added ? (
                      <span className="flex items-center gap-1.5">
                        <Check size={14} strokeWidth={3} /> Added
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <ShoppingCart size={14} /> Quick Add
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Details */}
          <div className="flex flex-col flex-grow p-5 pt-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#81bf42]">
                {product.brand}
              </span>
              {product.isNew && (
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  NEW
                </span>
              )}
            </div>

            <h3 className="text-gray-800 font-semibold text-sm leading-snug line-clamp-2 min-h-[40px] mb-3 group-hover:text-[#004b9c] transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <Stars rating={product.rating} />
              <span className="text-[11px] font-medium text-gray-400">
                ({product.reviews})
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#004b9c] leading-none">
                  {priceDisplay}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-[11px] text-gray-400 line-through mt-1">
                    AED {product.originalPrice}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#004b9c] group-hover:text-white transition-all duration-300">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white py-20 lg:py-32 font-['Poppins',_sans-serif]"
    >
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-green-50/50 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-[#81bf42]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#81bf42]">
                Trending Collections
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Elite Performance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b9c] to-[#002f6c]">
                Most Popular Gear
              </span>
            </h2>
            <p className="text-gray-500 text-base mt-6 max-w-lg leading-relaxed">
              Equip yourself with the same gear used by professionals. Our
              most-wanted cricket equipment and apparel, updated daily.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/shop"
              className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#004b9c] transition-all duration-300 shadow-xl hover:shadow-blue-200"
            >
              Explore Full Catalog
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {PRODUCTS.slice(0, 5).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
