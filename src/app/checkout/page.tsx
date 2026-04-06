// src/app/checkout/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, CreditCard, Truck, CheckCircle2,
  ArrowRight, Loader2, MapPin, Plus,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  size: string;
  image?: string;
}

interface SavedAddress {
  address: string;
  city: string;
  emirate: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("cod");

  const [info, setInfo] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", city: "", emirate: "", notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated") {
      fetchCart();
      fetchSavedAddress();
      // Pre-fill name/email from session
      const nameParts = (session.user?.name ?? "").split(" ");
      setInfo((prev) => ({
        ...prev,
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" ") ?? "",
        email: session.user?.email ?? "",
      }));
    }
  }, [status]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAddress = async () => {
    try {
      const res = await fetch("/api/users/address");
      if (res.ok) {
        const data = await res.json();
        if (data?.address) {
          setSavedAddress(data);
          setInfo((prev) => ({
            ...prev,
            address: data.address,
            city: data.city,
            emirate: data.emirate,
          }));
        } else {
          setUseNewAddress(true);
        }
      } else {
        setUseNewAddress(true);
      }
    } catch {
      setUseNewAddress(true);
    }
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = delivery === "express" ? 50 : subtotal >= 500 ? 0 : 25;
  const total = subtotal + shippingCost;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const handlePlaceOrder = async () => {
    if (!info.firstName || !info.phone || !info.email || !info.address || !info.city) {
      alert("Please fill in all required fields.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${info.firstName} ${info.lastName}`.trim(),
          customerEmail: info.email,
          customerPhone: info.phone,
          deliveryAddress: info.address,
          city: info.city,
          emirate: info.emirate,
          paymentMethod: payment,
          deliveryType: delivery,
          notes: info.notes,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.qty,
            size: i.size,
            image: i.image,
          })),
          totalAmount: total,
          orderSource: "web",
          // Save address for future if using new address
          saveAddress: useNewAddress,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderNumber(data.orderNumber);
        // Clear cart
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clearAll: true }),
        });
        setConfirmed(true);
      } else {
        alert(data.error ?? "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all";

  // ── Order Confirmed Screen ──
  if (confirmed) {
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
          <p className="text-gray-500 text-[14px] mb-1">
            Thank you, <strong>{info.firstName}</strong>! Your order has been received.
          </p>
          <p className="text-[13px] font-bold text-[#004b9c] mb-2">Order #{orderNumber}</p>
          <p className="text-gray-400 text-[13px] mb-8">
            A confirmation has been sent to <span className="text-[#004b9c] font-semibold">{info.email}</span>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</p>
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-[13px] text-gray-700 mb-1.5">
                <span className="truncate max-w-[200px]">{item.name} ×{item.qty}</span>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#004b9c] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/cart" className="hover:text-[#004b9c] transition-colors">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-semibold">Checkout</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT — Forms */}
          <div className="xl:col-span-2 flex flex-col gap-6">

            {/* 1. Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name *", key: "firstName", placeholder: "Ahmed" },
                  { label: "Last Name", key: "lastName", placeholder: "Al Mansoori" },
                  { label: "Phone Number *", key: "phone", placeholder: "+971 52 XXX XXXX" },
                  { label: "Email Address *", key: "email", placeholder: "you@example.com" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                    <input
                      type="text"
                      value={info[key as keyof typeof info]}
                      onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">2</span>
                Shipping Address
              </h3>

              {/* Saved address option */}
              {savedAddress && (
                <div className="flex flex-col gap-3 mb-5">
                  <label
                    className={`flex items-start gap-3 border-2 rounded-xl px-5 py-4 cursor-pointer transition-all duration-150 ${
                      !useNewAddress ? "border-[#004b9c] bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${!useNewAddress ? "border-[#004b9c]" : "border-gray-300"}`}>
                      {!useNewAddress && <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={13} className="text-[#004b9c]" />
                        <p className="text-[13px] font-bold text-gray-800">Saved Address</p>
                      </div>
                      <p className="text-[13px] text-gray-500">
                        {savedAddress.address}, {savedAddress.city}, {savedAddress.emirate}
                      </p>
                    </div>
                    <input type="radio" name="addrType" className="sr-only" checked={!useNewAddress} onChange={() => setUseNewAddress(false)} />
                  </label>

                  <label
                    className={`flex items-center gap-3 border-2 rounded-xl px-5 py-4 cursor-pointer transition-all duration-150 ${
                      useNewAddress ? "border-[#004b9c] bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${useNewAddress ? "border-[#004b9c]" : "border-gray-300"}`}>
                      {useNewAddress && <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus size={13} className="text-gray-500" />
                      <p className="text-[13px] font-bold text-gray-700">Use a Different Address</p>
                    </div>
                    <input type="radio" name="addrType" className="sr-only" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                  </label>
                </div>
              )}

              {/* New address form — shown if no saved address OR useNewAddress selected */}
              <AnimatePresence>
                {(useNewAddress || !savedAddress) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Address *</label>
                      <input
                        type="text"
                        value={info.address}
                        onChange={(e) => setInfo({ ...info, address: e.target.value })}
                        placeholder="Building, Street, Area"
                        className={inputClass}
                      />
                    </div>
                    {[
                      { label: "City *", key: "city", placeholder: "Dubai" },
                      { label: "Emirate", key: "emirate", placeholder: "Dubai" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                        <input
                          type="text"
                          value={info[key as keyof typeof info]}
                          onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                          placeholder={placeholder}
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Notes (optional)</label>
                      <textarea
                        value={info.notes}
                        onChange={(e) => setInfo({ ...info, notes: e.target.value })}
                        placeholder="Any special instructions..."
                        rows={3}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* If using saved address, still allow notes */}
              {!useNewAddress && savedAddress && (
                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Notes (optional)</label>
                  <textarea
                    value={info.notes}
                    onChange={(e) => setInfo({ ...info, notes: e.target.value })}
                    placeholder="Any special instructions..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              )}
            </div>

            {/* 3. Delivery */}
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
                      delivery === opt.id ? "border-[#004b9c] bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${delivery === opt.id ? "border-[#004b9c]" : "border-gray-300"}`}>
                        {delivery === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-800">{opt.label}</p>
                        <p className="text-[12px] text-gray-400">{opt.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[14px] font-black ${opt.price === "Free" ? "text-[#81bf42]" : "text-gray-700"}`}>
                      {opt.price}
                    </span>
                    <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="sr-only" />
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">4</span>
                Payment
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { id: "cod", label: "Cash on Delivery", icons: ["COD"] },
                  { id: "card", label: "Credit / Debit Card", icons: ["VISA", "MC"] },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between gap-4 border-2 rounded-xl px-5 py-4 cursor-pointer transition-all duration-150 ${
                      payment === opt.id ? "border-[#004b9c] bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payment === opt.id ? "border-[#004b9c]" : "border-gray-300"}`}>
                        {payment === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />}
                      </div>
                      <p className="text-[14px] font-bold text-gray-800">{opt.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {opt.icons.map((ic) => (
                        <span key={ic} className="text-[10px] font-black border border-gray-200 px-2 py-0.5 rounded text-gray-500">{ic}</span>
                      ))}
                    </div>
                    <input type="radio" name="payment" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} className="sr-only" />
                  </label>
                ))}
              </div>

              {/* Card fields */}
              <AnimatePresence>
                {payment === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className={inputClass} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                      <input type="text" placeholder="MM / YY" className={inputClass} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CVV</label>
                      <input type="text" placeholder="•••" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cardholder Name</label>
                      <input type="text" placeholder="Name on card" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-[12px] text-amber-700 font-semibold">
                        ⚠️ Card payment integration coming soon. Please use Cash on Delivery for now.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h2 className="text-[16px] font-black text-gray-800 uppercase tracking-wider mb-5">
                Order Summary
              </h2>

              {/* Items mini list */}
              <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-gray-100">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#004b9c] font-black text-[9px] italic">{item.brand}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-700 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400">×{item.qty} · {item.size}</p>
                    </div>
                    <p className="text-[13px] font-black text-[#004b9c] flex-shrink-0">AED {item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({totalQty} items)</span>
                  <span className="font-bold text-gray-800">AED {subtotal.toLocaleString()}</span>
                </div>
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

              <button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
                className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_28px_rgba(0,75,156,0.4)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <><Loader2 size={15} className="animate-spin" /> PLACING ORDER...</>
                ) : (
                  <><CreditCard size={15} /> PLACE ORDER</>
                )}
              </button>
              <button
                onClick={() => router.push("/cart")}
                className="mt-3 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:text-[#004b9c] transition-colors py-1 w-full"
              >
                ← Back to Cart
              </button>

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
      </div>
    </div>
  );
}