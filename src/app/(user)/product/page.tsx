"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBasket, ChevronRight, Star, Shield, Truck,
  RotateCcw, Plus, Minus, ChevronDown, ChevronUp,
  Zap, Award, Users, CheckCircle2, ArrowRight, Heart,
} from "lucide-react";

// ── Dummy product data ──
const PRODUCT = {
  name: "MRF Genius Grand Edition",
  brand: "MRF",
  category: "English Willow · Grade 1",
  sku: "MRF-GGE-001",
  rating: 4.9,
  reviewCount: 247,
  originalPrice: 1650,
  price: 1299,
  discount: 21,
  badge: "BEST SELLER",
  inStock: true,
  stockLeft: 6,
  description:
    "The MRF Genius Grand Edition is the bat of champions — used by Virat Kohli himself on the international stage. Crafted from the finest Grade 1 English Willow, this bat delivers exceptional power, a massive sweet spot, and unmatched durability. Whether you're dominating at the crease or training hard, this is the ultimate weapon.",
  features: [
    "Grade 1 English Willow — premium willow with natural bow",
    "Massive sweet spot for explosive stroke play",
    "Traditionally shaped blade for all-round performance",
    "Optimum weight distribution for balance & power",
    "Used by Virat Kohli — ICC #1 ranked batter",
    "Includes MRF grip & protective toe guard",
  ],
  specs: [
    { label: "Willow Grade", value: "Grade 1 English Willow" },
    { label: "Blade Type", value: "Full Blade" },
    { label: "Handle", value: "Oval Cane Handle" },
    { label: "Weight", value: "1150g – 1200g" },
    { label: "Recommended For", value: "Club to Professional" },
    { label: "Country of Origin", value: "India" },
  ],
  sizes: ["SH", "LH", "SH+"],
  reviews: [
    { name: "Khalid Al Rashidi", rating: 5, date: "Mar 2026", comment: "Absolute beast of a bat. The pickup is incredible, feels so light in hand but hits so hard. Worth every dirham!" },
    { name: "Priya Nair", rating: 5, date: "Feb 2026", comment: "Bought this for my husband as a gift. He hasn't stopped talking about it. Delivery was super fast from iSPORTS." },
    { name: "Rahul Sharma", rating: 4, date: "Jan 2026", comment: "Great bat, solid quality. Took a little knocking in but after that it's been phenomenal. Highly recommend." },
  ],
};

const SUGGESTED = [
  { id: 1, name: "Shrey Matrix Air 2.0 Helmet", price: 299, originalPrice: 380, label: "Helmet", category: "Protection · Essential", badge: "PAIRS PERFECTLY" },
  { id: 2, name: "Kookaburra Pro 4.0 Training Balls (6-Pack)", price: 89, originalPrice: 120, label: "Ball", category: "Training · 6 Pack", badge: "MOST POPULAR" },
  { id: 3, name: "MRF Cricket Batting Gloves", price: 149, originalPrice: 199, label: "Gloves", category: "Protection · Grade A", badge: "SAME BRAND" },
  { id: 4, name: "SS Ton Cricket Kit Bag", price: 249, originalPrice: 320, label: "Bag", category: "Gear · Premium", badge: "TOP RATED" },
];

const TRUST_BADGES = [
  { icon: Truck, title: "Free Delivery", desc: "Orders over AED 500" },
  { icon: Shield, title: "100% Authentic", desc: "Genuine products only" },
  { icon: RotateCcw, title: "14-Day Returns", desc: "Hassle-free returns" },
  { icon: Award, title: "Expert Advice", desc: "24/7 cricket support" },
];

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = useState("SH");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "reviews">("features");
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const savings = PRODUCT.originalPrice - PRODUCT.price;
  const whatsappMsg = encodeURIComponent(
    `Hi iSPORTS! I'm interested in the ${PRODUCT.name} (${selectedSize}). Can you help me?`
  );

  // Fake image placeholders
  const images = [
    { label: PRODUCT.brand, bg: "from-blue-50 to-blue-100" },
    { label: "Side View", bg: "from-green-50 to-green-100" },
    { label: "Detail", bg: "from-blue-50 to-indigo-100" },
    { label: "Profile", bg: "from-slate-50 to-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-white font-poppins">

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-6">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:text-[#004b9c] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-[#004b9c] transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link href="/category/bats" className="hover:text-[#004b9c] transition-colors">Bats</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-semibold truncate max-w-[180px]">{PRODUCT.name}</span>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN PRODUCT SECTION
      ══════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── LEFT: Image Gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 aspect-square flex items-center justify-center border border-gray-100">
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="bg-[#81bf42] text-white text-[10px] font-black tracking-[0.15em] px-3 py-1.5 rounded-full uppercase">
                  {PRODUCT.badge}
                </span>
                <span className="bg-[#004b9c] text-white text-[10px] font-black tracking-[0.1em] px-3 py-1.5 rounded-full uppercase">
                  SAVE {PRODUCT.discount}%
                </span>
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200"
              >
                <Heart
                  size={18}
                  className={wishlist ? "fill-red-500 text-red-500" : "text-gray-400"}
                  strokeWidth={1.8}
                />
              </button>

              {/* Product placeholder — replace with <Image> */}
              <div className="text-center">
                <p className="text-[80px] font-black italic text-[#004b9c]/20 leading-none select-none">
                  {PRODUCT.brand}
                </p>
                <p className="text-gray-400 text-[13px] mt-2 font-medium">Product Image {activeImage + 1}</p>
                <p className="text-gray-300 text-[11px]">Replace with &lt;Image&gt; tag</p>
              </div>

              {/* Stock urgency */}
              {PRODUCT.stockLeft <= 8 && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2 border border-red-100">
                  <Zap size={14} className="text-red-500 flex-shrink-0" fill="currentColor" />
                  <p className="text-[12px] font-bold text-red-600">
                    Only {PRODUCT.stockLeft} left in stock — order soon!
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-xl overflow-hidden aspect-square bg-gradient-to-br ${img.bg} flex items-center justify-center border-2 transition-all duration-150 ${
                    activeImage === i ? "border-[#004b9c] shadow-[0_0_0_3px_rgba(0,75,156,0.15)]" : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <span className="text-[9px] font-bold text-gray-400 text-center px-1">{img.label}</span>
                </button>
              ))}
            </div>

            {/* Pro use badge */}
            <div className="bg-gradient-to-r from-[#004b9c] to-[#003d82] rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <Award size={20} className="text-[#81bf42]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white font-black text-[13px] uppercase tracking-wider">Used By Professionals</p>
                <p className="text-blue-200 text-[12px] mt-0.5">
                  Virat Kohli's bat of choice on the international stage
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Product Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Brand + Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
                <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">
                  {PRODUCT.brand} · {PRODUCT.category}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 italic uppercase leading-tight mb-3">
                {PRODUCT.name}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < Math.floor(PRODUCT.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
                    />
                  ))}
                  <span className="text-[13px] font-black text-gray-800 ml-1">{PRODUCT.rating}</span>
                </div>
                <span className="text-[13px] text-gray-400">
                  ({PRODUCT.reviewCount} verified reviews)
                </span>
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-[#81bf42]" />
                  <span className="text-[12px] font-bold text-[#81bf42]">1,000+ sold in UAE</span>
                </div>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-black text-[#004b9c]">
                  AED {PRODUCT.price.toLocaleString()}
                </span>
                <span className="text-[18px] text-gray-300 line-through font-medium">
                  AED {PRODUCT.originalPrice.toLocaleString()}
                </span>
                <span className="bg-[#81bf42] text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                  SAVE AED {savings}
                </span>
              </div>
              <p className="text-gray-400 text-[12px] mt-1.5">
                Inclusive of VAT · Free delivery on this order
              </p>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Select Size</p>
                <button className="text-[12px] text-[#004b9c] font-semibold hover:underline">Size Guide →</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {PRODUCT.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl border-2 text-[13px] font-black transition-all duration-150 ${
                      selectedSize === size
                        ? "border-[#004b9c] bg-[#004b9c] text-white shadow-[0_4px_16px_rgba(0,75,156,0.3)]"
                        : "border-gray-200 text-gray-600 hover:border-[#004b9c] hover:text-[#004b9c]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider">Quantity</p>
              <div className="flex gap-3 flex-wrap">
                {/* Qty control */}
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-[16px] font-black text-gray-800">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.35)] hover:shadow-[0_8px_32px_rgba(0,75,156,0.45)] active:scale-[0.97] transition-all duration-200"
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Added to Cart!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBasket size={16} /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Buy Now */}
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-[#004b9c] text-[#004b9c] text-[13px] font-black tracking-wider uppercase hover:bg-[#004b9c] hover:text-white transition-all duration-200 active:scale-[0.97]"
              >
                BUY NOW — AED {(PRODUCT.price * qty).toLocaleString()} <ArrowRight size={15} />
              </Link>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/971526514666?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-black tracking-wider uppercase transition-all duration-200 active:scale-[0.97]"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.title} className="flex flex-col items-center text-center gap-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <Icon size={18} className="text-[#004b9c]" strokeWidth={1.8} />
                    <p className="text-[11px] font-black text-gray-700 uppercase tracking-wide leading-tight">{badge.title}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{badge.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* SKU */}
            <p className="text-[11px] text-gray-300 font-medium">
              SKU: {PRODUCT.sku} · Size selected: <strong className="text-gray-400">{selectedSize}</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TABS: Features / Specs / Reviews
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">

          {/* Tab Nav */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit mb-10">
            {(["features", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[#004b9c] text-white shadow-[0_4px_12px_rgba(0,75,156,0.3)]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "reviews" ? `Reviews (${PRODUCT.reviewCount})` : tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* Features Tab */}
            {activeTab === "features" && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
                    <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">Why Choose This Bat</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900 italic uppercase mb-6 leading-tight">
                    Built For<br />Champions
                  </h2>
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                    {PRODUCT.description}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {PRODUCT.features.map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#81bf42]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 size={12} className="text-[#81bf42]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[14px] text-gray-700 font-medium leading-snug">{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Emotion block */}
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-[#004b9c] to-[#003d82] rounded-2xl p-7 text-white">
                    <p className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase mb-3">THE iSPORTS PROMISE</p>
                    <h3 className="text-xl font-black italic uppercase leading-tight mb-3">
                      Every Great Innings<br />Starts With The<br />Right Bat
                    </h3>
                    <p className="text-blue-200 text-[13px] leading-relaxed">
                      We've helped over 1,000 cricketers across the UAE find their perfect match. The MRF Genius Grand Edition isn't just a bat — it's your competitive edge.
                    </p>
                  </div>

                  {/* Social proof counter */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { number: "1,000+", label: "UAE Players" },
                      { number: "4.9★", label: "Avg Rating" },
                      { number: "247", label: "Reviews" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                        <p className="text-[20px] font-black text-[#004b9c] italic">{stat.number}</p>
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp repeat CTA */}
                  <a
                    href={`https://wa.me/971526514666?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 py-4 rounded-xl text-[13px] font-black tracking-wider uppercase transition-all duration-200 active:scale-[0.97]"
                    style={{ backgroundColor: "#25D366", color: "white" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Ask an Expert on WhatsApp
                  </a>
                </div>
              </motion.div>
            )}

            {/* Specs Tab */}
            {activeTab === "specs" && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
                  <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">Technical Specifications</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {PRODUCT.specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={`flex items-center gap-4 px-6 py-4 ${
                        i !== PRODUCT.specs.length - 1 ? "border-b border-gray-50" : ""
                      } ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider w-40 flex-shrink-0">
                        {spec.label}
                      </span>
                      <span className="text-[14px] font-semibold text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6 max-w-3xl"
              >
                {/* Rating summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-8 flex-wrap">
                  <div className="text-center">
                    <p className="text-6xl font-black text-[#004b9c] italic">{PRODUCT.rating}</p>
                    <div className="flex items-center gap-1 justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[12px] text-gray-400 mt-1">{PRODUCT.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-gray-500 w-4">{star}</span>
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: star === 5 ? "82%" : star === 4 ? "12%" : "4%" }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 w-8 text-right">
                          {star === 5 ? "82%" : star === 4 ? "12%" : "4%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review cards */}
                {PRODUCT.reviews.map((review, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#004b9c]/10 flex items-center justify-center font-black text-[#004b9c] text-[13px]">
                          {review.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-[14px]">{review.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(review.rating)].map((_, j) => (
                              <Star key={j} size={11} className="text-amber-400 fill-amber-400" />
                            ))}
                            <span className="ml-1.5 text-[10px] bg-[#81bf42]/15 text-[#81bf42] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-300 font-medium flex-shrink-0">{review.date}</span>
                    </div>
                    <p className="text-gray-600 text-[14px] leading-relaxed">"{review.comment}"</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SUGGESTED PRODUCTS
      ══════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
          <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">
            Complete Your Kit
          </span>
        </div>
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 italic uppercase leading-tight">
            Pairs Perfectly<br />With This Bat
          </h2>
          <Link href="/shop" className="text-[13px] font-black text-[#004b9c] hover:underline flex items-center gap-1 uppercase tracking-wider">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUGGESTED.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(0,75,156,0.1)] hover:border-[#004b9c]/20 transition-all duration-300 group cursor-pointer"
            >
              {/* Product image placeholder */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 aspect-[4/3] flex items-center justify-center relative">
                <span className="text-[#004b9c]/30 font-black text-[28px] italic">{product.label}</span>
                <span className="absolute top-3 left-3 bg-[#81bf42] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.badge}
                </span>
                {/* Discount badge */}
                <span className="absolute top-3 right-3 bg-[#004b9c] text-white text-[9px] font-black px-2 py-1 rounded-full">
                  SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </div>

              <div className="p-4">
                <p className="text-[10px] font-black text-[#81bf42] tracking-[0.15em] uppercase mb-1">
                  {product.category}
                </p>
                <h3 className="text-gray-800 font-bold text-[14px] leading-snug mb-3 group-hover:text-[#004b9c] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#004b9c] font-black text-[16px]">AED {product.price}</span>
                    <span className="text-gray-300 text-[12px] line-through ml-2">AED {product.originalPrice}</span>
                  </div>
                  <button className="w-9 h-9 rounded-xl bg-[#004b9c]/8 hover:bg-[#004b9c] text-[#004b9c] hover:text-white flex items-center justify-center transition-all duration-200">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          STICKY BOTTOM BAR (mobile)
      ══════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] px-4 py-3 flex gap-3">
        <a
          href={`https://wa.me/971526514666?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#004b9c] text-white text-[12px] font-black tracking-wider uppercase shadow-[0_4px_16px_rgba(0,75,156,0.35)] active:scale-[0.97] transition-all"
        >
          <ShoppingBasket size={16} />
          {addedToCart ? "Added!" : `Add to Cart — AED ${(PRODUCT.price * qty).toLocaleString()}`}
        </button>
      </div>

      {/* Mobile bottom spacer */}
      <div className="h-20 lg:hidden" />

    </div>
  );
}