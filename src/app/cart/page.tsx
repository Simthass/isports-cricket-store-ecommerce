"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Plus, Minus, ShoppingBasket, ArrowRight,
  Tag, ChevronRight, CreditCard, Truck, CheckCircle2,
} from "lucide-react";

const DUMMY_CART = [
  {
    id: 1,
    name: "SS Ton Reserve Edition English Willow Bat",
    brand: "SS Ton",
    category: "Bats",
    price: 649,
    qty: 1,
    image: null,
    label: "Bat",
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
    image: null,
    label: "Helmet",
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
    image: null,
    label: "Ball",
    size: "Standard",
    inStock: true,
  },
];

type Step = "cart" | "checkout" | "confirmed";

export default function CartPage() {
  const [items, setItems] = useState(DUMMY_CART);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [info, setInfo] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", city: "", emirate: "", notes: "",
  });

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
  const shippingCost = delivery === "express" ? 50 : subtotal >= 500 ? 0 : 25;
  const total = subtotal - discount + shippingCost;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  // ── Order Confirmed ──
  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#81bf42]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-[#81bf42]" strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-[14px] mb-2">
            Thank you, <strong>{info.firstName || "Customer"}</strong>! Your order has been received.
          </p>
          <p className="text-gray-400 text-[13px] mb-8">
            We'll send a confirmation to <span className="text-[#004b9c] font-semibold">{info.email || "your email"}</span>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</p>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-[13px] text-gray-700 mb-1.5">
                <span>{item.name.split(" ").slice(0, 4).join(" ")}... ×{item.qty}</span>
                <span className="font-bold">AED {item.price * item.qty}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-black text-[#004b9c]">
              <span>Total</span>
              <span>AED {total.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase transition-all duration-200 shadow-[0_4px_20px_rgba(0,75,156,0.3)]"
          >
            CONTINUE SHOPPING <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#004b9c] transition-colors">Home</Link>
          <ChevronRight size={12} />
          {step === "checkout" ? (
            <>
              <button onClick={() => setStep("cart")} className="hover:text-[#004b9c] transition-colors">Cart</button>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-semibold">Checkout</span>
            </>
          ) : (
            <span className="text-gray-700 font-semibold">Cart</span>
          )}
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-3 mb-10">
          {["Cart", "Checkout", "Confirmed"].map((s, i) => {
            const stepMap: Record<string, number> = { cart: 0, checkout: 1, confirmed: 2 };
            const current = stepMap[step];
            const active = i <= current;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-200 ${
                    active ? "bg-[#004b9c] text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-[13px] font-bold hidden sm:block ${active ? "text-[#004b9c]" : "text-gray-400"}`}>
                    {s}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-[2px] rounded-full transition-all duration-300 ${i < stepMap[step] ? "bg-[#004b9c]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            <ShoppingBasket size={64} className="text-gray-200" strokeWidth={1.2} />
            <h2 className="text-2xl font-black text-gray-700 uppercase italic">Your cart is empty</h2>
            <p className="text-gray-400 text-[15px] max-w-sm">Let's find you some great cricket gear.</p>
            <Link href="/shop" className="mt-3 flex items-center gap-2 px-8 py-3 rounded-xl bg-[#004b9c] text-white text-[13px] font-black tracking-wider uppercase hover:bg-[#003d82] transition-all shadow-lg">
              BROWSE SHOP <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* ══════════════════════════════════════
                LEFT — CART ITEMS or CHECKOUT FORM
            ══════════════════════════════════════ */}
            <div className="xl:col-span-2 flex flex-col gap-5">

              {/* ── STEP: CART ── */}
              {step === "cart" && (
                <>
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
                        {/* Placeholder image */}
                        <div className="w-full sm:w-[100px] h-[100px] flex-shrink-0 bg-blue-50 rounded-xl flex items-center justify-center">
                          <span className="text-[#004b9c] font-black text-[22px] italic">{item.label}</span>
                        </div>

                        <div className="flex flex-col flex-1 gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-black text-[#81bf42] tracking-[0.15em] uppercase">
                                {item.brand} · {item.category}
                              </p>
                              <h3 className="text-gray-800 font-bold text-[15px] leading-snug mt-0.5">
                                {item.name}
                              </h3>
                              <p className="text-gray-400 text-[12px] mt-0.5">Size: {item.size}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-4 mt-auto pt-2">
                            <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-[14px] font-black text-gray-800 w-8 text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, 1)}
                                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-[#004b9c] font-black text-[18px]">
                              AED {(item.price * item.qty).toLocaleString()}
                              {item.qty > 1 && (
                                <span className="text-gray-400 text-[12px] font-normal ml-2">
                                  AED {item.price} each
                                </span>
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
                      <Truck size={18} className="text-[#81bf42] flex-shrink-0" />
                      <p className="text-[13px] text-gray-700 font-semibold">
                        Add <strong className="text-[#004b9c]">AED {500 - subtotal}</strong> more to get FREE delivery!
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── STEP: CHECKOUT FORM ── */}
              {step === "checkout" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-6"
                >
                  {/* Personal Information */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">1</span>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "First Name", key: "firstName", placeholder: "Ahmed" },
                        { label: "Last Name", key: "lastName", placeholder: "Al Mansoori" },
                        { label: "Phone Number", key: "phone", placeholder: "+971 52 XXX XXXX" },
                        { label: "Email Address", key: "email", placeholder: "you@example.com" },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key} className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                          <input
                            type="text"
                            value={info[key as keyof typeof info]}
                            onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">2</span>
                      Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
                        <input
                          type="text"
                          value={info.address}
                          onChange={(e) => setInfo({ ...info, address: e.target.value })}
                          placeholder="Building, Street, Area"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                        />
                      </div>
                      {[
                        { label: "City", key: "city", placeholder: "Dubai" },
                        { label: "Emirate", key: "emirate", placeholder: "Dubai" },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key} className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                          <input
                            type="text"
                            value={info[key as keyof typeof info]}
                            onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Notes (optional)</label>
                        <textarea
                          value={info.notes}
                          onChange={(e) => setInfo({ ...info, notes: e.target.value })}
                          placeholder="Any special instructions for your order..."
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">3</span>
                      Delivery
                    </h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { id: "standard", label: "Standard Delivery", desc: "3–5 business days", price: subtotal >= 500 ? "Free" : "AED 25" },
                        { id: "express", label: "Express Shipping", desc: "Next business day", price: "AED 50" },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between gap-4 border-2 rounded-xl px-5 py-4 cursor-pointer transition-all duration-150 ${
                            delivery === opt.id
                              ? "border-[#004b9c] bg-blue-50/50"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              delivery === opt.id ? "border-[#004b9c]" : "border-gray-300"
                            }`}>
                              {delivery === opt.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-800">{opt.label}</p>
                              <p className="text-[12px] text-gray-400">{opt.desc}</p>
                            </div>
                          </div>
                          <span className={`text-[14px] font-black ${opt.price === "Free" ? "text-[#81bf42]" : "text-gray-700"}`}>
                            {opt.price}
                          </span>
                          <input
                            type="radio"
                            name="delivery"
                            value={opt.id}
                            checked={delivery === opt.id}
                            onChange={() => setDelivery(opt.id)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">4</span>
                      Payment
                    </h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { id: "card", label: "Credit / Debit Card", icons: ["VISA", "MC"] },
                        { id: "cod", label: "Cash on Delivery", icons: ["COD"] },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between gap-4 border-2 rounded-xl px-5 py-4 cursor-pointer transition-all duration-150 ${
                            payment === opt.id
                              ? "border-[#004b9c] bg-blue-50/50"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              payment === opt.id ? "border-[#004b9c]" : "border-gray-300"
                            }`}>
                              {payment === opt.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />
                              )}
                            </div>
                            <p className="text-[14px] font-bold text-gray-800">{opt.label}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {opt.icons.map((ic) => (
                              <span key={ic} className="text-[10px] font-black border border-gray-200 px-2 py-0.5 rounded text-gray-500">
                                {ic}
                              </span>
                            ))}
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            checked={payment === opt.id}
                            onChange={() => setPayment(opt.id)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>

                    {/* Card fields */}
                    {payment === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CVV</label>
                          <input
                            type="text"
                            placeholder="•••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                        </div>
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="Name on card"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ══════════════════════════════════════
                RIGHT — ORDER SUMMARY
            ══════════════════════════════════════ */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                <h2 className="text-[16px] font-black text-gray-800 uppercase tracking-wider mb-5">
                  Order Summary
                </h2>

                {/* Coupon — only on cart step */}
                {step === "cart" && (
                  <div className="flex gap-2 mb-5">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => coupon.trim() && setCouponApplied(true)}
                      className="px-4 py-2.5 rounded-xl border-2 border-[#004b9c] text-[#004b9c] text-[11px] font-black tracking-wider hover:bg-[#004b9c] hover:text-white transition-all duration-200"
                    >
                      APPLY
                    </button>
                  </div>
                )}
                {couponApplied && (
                  <p className="text-[#81bf42] text-[12px] font-bold mb-4 flex items-center gap-1">
                    ✓ Coupon applied — 10% off!
                  </p>
                )}

                {/* Cart items mini list on checkout step */}
                {step === "checkout" && (
                  <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-[#004b9c] font-black text-[9px] italic">{item.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-gray-700 truncate">{item.name.split(" ").slice(0, 4).join(" ")}...</p>
                          <p className="text-[11px] text-gray-400">×{item.qty}</p>
                        </div>
                        <p className="text-[13px] font-black text-[#004b9c] flex-shrink-0">AED {item.price * item.qty}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Breakdown */}
                <div className="flex flex-col gap-3 text-[14px] border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({totalQty} items)</span>
                    <span className="font-bold text-gray-800">AED {subtotal.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-[#81bf42]">
                      <span>Discount (10%)</span>
                      <span className="font-bold">- AED {discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-bold ${shippingCost === 0 ? "text-[#81bf42]" : "text-gray-800"}`}>
                      {shippingCost === 0 ? "FREE" : `AED ${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[18px] font-black text-gray-900 border-t border-gray-100 pt-3 mt-1">
                    <span>Total</span>
                    <span className="text-[#004b9c]">AED {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA Button */}
                {step === "cart" ? (
                  <>
                    <button
                      onClick={() => setStep("checkout")}
                      className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_28px_rgba(0,75,156,0.4)] active:scale-[0.98] transition-all duration-200"
                    >
                      PROCEED TO CHECKOUT <ArrowRight size={15} />
                    </button>
                    <Link href="/shop" className="mt-3 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:text-[#004b9c] transition-colors py-1">
                      ← Continue Shopping
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setStep("confirmed")}
                      className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_28px_rgba(0,75,156,0.4)] active:scale-[0.98] transition-all duration-200"
                    >
                      <CreditCard size={15} /> PLACE ORDER
                    </button>
                    <button
                      onClick={() => setStep("cart")}
                      className="mt-3 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:text-[#004b9c] transition-colors py-1 w-full"
                    >
                      ← Back to Cart
                    </button>
                  </>
                )}

                {/* Trust badges */}
                <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
                  {[
                    "Secure Checkout — SSL Encrypted",
                    "Free Returns Within 14 Days",
                    "Authentic Products Guaranteed",
                  ].map((t) => (
                    <p key={t} className="text-[11.5px] text-gray-400 flex items-center gap-2">
                      <span className="text-[#81bf42] font-black">✓</span> {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}