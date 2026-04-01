"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBasket, ArrowRight, Tag, ChevronRight } from "lucide-react";

const DUMMY_CART = [
  {
    id: 1,
    name: "SS Ton Reserve Edition English Willow Bat",
    brand: "SS Ton",
    category: "Bats",
    price: 649,
    qty: 1,
    image: "https://placehold.co/120x140/e8f0fc/004b9c?text=Bat",
    size: "SH",
    inStock: true,
  },
  {
    id: 2,
    name: "Shrey Matrix Air 2.0 Cricket Helmet",
    brand: "Shrey",
    category: "Helmets",
    price: 299,
    qty: 2,
    image: "https://placehold.co/120x140/e8f0fc/004b9c?text=Helmet",
    size: "M",
    inStock: true,
  },
  {
    id: 3,
    name: "Kookaburra Pro 4.0 Training Cricket Balls (6-Pack)",
    brand: "Kookaburra",
    category: "Balls",
    price: 89,
    qty: 1,
    image: "https://placehold.co/120x140/e8f0fc/004b9c?text=Ball",
    size: "Standard",
    inStock: false,
  },
];

export default function CartPage() {
  const [items, setItems] = useState(DUMMY_CART);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal - discount + shipping;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Banner ── */}
      <section className="bg-[#004b9c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #81bf42 0%, transparent 60%)" }}
        />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[#81bf42] text-[12px] font-bold tracking-[0.2em] uppercase mb-3">Your Selection</p>
            <h1 className="text-white text-4xl lg:text-5xl font-bold leading-tight mb-4">Shopping Cart</h1>
            <p className="text-blue-200 text-[15px]">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
          </motion.div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            <ShoppingBasket size={64} className="text-gray-200" strokeWidth={1.2} />
            <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
            <p className="text-gray-400 text-[15px] max-w-sm">Looks like you haven't added anything yet. Let's find you some great cricket gear.</p>
            <Link href="/shop" className="mt-3 flex items-center gap-2 px-8 py-3 rounded-xl bg-[#004b9c] text-white text-[13px] font-bold tracking-wider hover:bg-[#003d82] transition-all duration-200 shadow-lg">
              BROWSE SHOP <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* ── Cart Items ── */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-[12px] text-gray-400 mb-2">
                <Link href="/" className="hover:text-[#004b9c] transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-gray-700 font-medium">Cart</span>
              </div>

              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-5"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-[100px] flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full sm:w-[100px] h-[110px] object-cover rounded-xl bg-blue-50" />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold text-[#81bf42] tracking-widest uppercase">{item.brand} · {item.category}</p>
                          <h3 className="text-gray-800 font-semibold text-[15px] leading-snug mt-0.5">{item.name}</h3>
                          <p className="text-gray-400 text-[12px] mt-1">Size: {item.size}</p>
                          {!item.inStock && (
                            <span className="inline-block mt-1 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Out of Stock</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-4 mt-auto pt-2">
                        {/* Qty control */}
                        <div className="flex items-center gap-3 border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-[14px] font-bold text-gray-800 w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        {/* Price */}
                        <p className="text-[#004b9c] font-bold text-[18px]">
                          AED {(item.price * item.qty).toLocaleString()}
                          {item.qty > 1 && (
                            <span className="text-gray-400 text-[12px] font-normal ml-2">AED {item.price} each</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Free shipping notice */}
              {subtotal < 500 && (
                <div className="bg-[#81bf42]/10 border border-[#81bf42]/30 rounded-xl px-5 py-3.5 flex items-center gap-3">
                  <span className="text-[#81bf42] text-lg">🏏</span>
                  <p className="text-[13px] text-gray-700 font-medium">
                    Add <strong className="text-[#004b9c]">AED {500 - subtotal}</strong> more to get FREE delivery!
                  </p>
                </div>
              )}
            </div>

            {/* ── Order Summary ── */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                <h2 className="text-[16px] font-bold text-gray-800 mb-5">Order Summary</h2>

                {/* Coupon */}
                <div className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => coupon.trim() && setCouponApplied(true)}
                    className="px-4 py-2.5 rounded-xl border border-[#004b9c] text-[#004b9c] text-[12px] font-bold hover:bg-[#004b9c] hover:text-white transition-all duration-200"
                  >
                    APPLY
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[#81bf42] text-[12px] font-semibold mb-4 flex items-center gap-1">
                    ✓ Coupon applied — 10% off!
                  </p>
                )}

                {/* Breakdown */}
                <div className="flex flex-col gap-3 text-[14px] border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                    <span className="font-semibold text-gray-800">AED {subtotal.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-[#81bf42]">
                      <span>Discount (10%)</span>
                      <span className="font-semibold">- AED {discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? "text-[#81bf42]" : "text-gray-800"}`}>
                      {shipping === 0 ? "FREE" : `AED ${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[18px] font-bold text-gray-900 border-t border-gray-100 pt-3 mt-1">
                    <span>Total</span>
                    <span className="text-[#004b9c]">AED {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-bold tracking-wider shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_28px_rgba(0,75,156,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  PROCEED TO CHECKOUT <ArrowRight size={15} />
                </Link>

                <Link href="/shop" className="mt-3 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:text-[#004b9c] transition-colors py-1">
                  ← Continue Shopping
                </Link>

                {/* Trust badges */}
                <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
                  {["Secure Checkout — SSL Encrypted", "Free Returns Within 14 Days", "Authentic Products Guaranteed"].map((t) => (
                    <p key={t} className="text-[11.5px] text-gray-400 flex items-center gap-2">
                      <span className="text-[#81bf42] font-bold">✓</span> {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}