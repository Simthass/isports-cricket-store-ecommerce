"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Plus, Minus, ShoppingBasket, ArrowRight,
  Tag, ChevronRight, CreditCard, Truck, CheckCircle2,
  MessageCircle, MapPin, Plus as PlusIcon, Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { showToast } from "@/components/ui/Toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface CartItemDisplay {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  qty: number;
  image: string | null;
  label: string;
  size: string;
  inStock: boolean;
}

type Step = "cart" | "checkout" | "confirmed";
type DeliveryMethod = "standard" | "express";

// ── Shared input style ─────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all";

// ── Small helper component ────────────────────────────────────────────────────
function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-[#004b9c] text-white text-[11px] font-black flex items-center justify-center">
        {number}
      </span>
      {title}
    </h3>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart, fetchCart, cartCount, isLoading } = useCart();
  const { data: session } = useSession();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  // Address form state
  const [info, setInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    emirate: "",
    notes: "",
  });

  // ── Load user data from database when logged in ──
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) {
        setLoadingUserData(false);
        return;
      }

      setLoadingUserData(true);
      try {
        const response = await fetch("/api/users/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const userData = data.user;
            setInfo({
              firstName: userData.firstName ?? "",
              lastName: userData.lastName ?? "",
              phone: userData.phone ?? "",
              email: userData.email ?? session.user.email ?? "",
              address: userData.address ?? "",
              city: userData.city ?? "",
              emirate: userData.emirate ?? "",
              notes: "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [session]);

  // Convert cart items to display format
  const items: CartItemDisplay[] = cartItems.map(item => ({
    id: item.productId,
    name: item.name,
    brand: item.brand,
    category: "Product",
    price: item.price,
    qty: item.quantity,
    image: item.image,
    label: item.name.substring(0, 3).toUpperCase(),
    size: item.size,
    inStock: true,
  }));

  // ── Calculations ─────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shippingCost = delivery === "express" ? 50 : subtotal >= 500 ? 0 : 25;
  const total = subtotal - discount + shippingCost;
  const totalQty = cartCount;

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Redirect to cart if someone tries to access checkout directly without items
  useEffect(() => {
    if (step === "checkout" && items.length === 0) {
      setStep("cart");
      router.push("/cart");
    }
  }, [step, items.length, router]);

  // Handle URL parameter for checkout step - redirect to cart if no items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get("step");
      if (stepParam === "checkout") {
        if (items.length > 0) {
          setStep("checkout");
        } else {
          router.push("/cart");
        }
      }
    }
  }, [items.length, router]);

  // Refresh cart when component mounts or when session changes
  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session, fetchCart]);

  // ── Cart helpers ──────────────────────────────────────────────────────────────
  const updateQty = (id: string, delta: number) => {
    const item = cartItems.find(i => i.productId === id);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateQuantity(id, item.size, newQty);
    }
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(i => i.productId === id);
    if (item) {
      removeFromCart(id, item.size);
    }
  };

  // ── Update form field ────────────────────────────────────────────────
  const handleInfoChange = (field: string, value: string) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  // WhatsApp Order - Creates order in database first, then opens WhatsApp
  // WhatsApp Order - Creates order in database for ALL users (guest or logged in)
const handleWhatsAppOrder = async () => {
  if (items.length === 0) {
    showToast("warning", "Empty Cart", "Your cart is empty.");
    return;
  }

  // Prepare customer info
  let customerName = "";
  let customerPhone = "";
  let customerEmail = "";
  let isLoggedIn = false;

  if (session?.user) {
    isLoggedIn = true;
    customerName = session.user.name || "";
    customerPhone = (session.user as any)?.phone || "";
    customerEmail = session.user.email || "";

    try {
      const res = await fetch("/api/users/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          customerName = data.user.name || customerName;
          customerPhone = data.user.phone || customerPhone;
          customerEmail = data.user.email || customerEmail;
        }
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
    }
  }

  const orderItems = cartItems.map(item => ({
    productId: item.productId,
    name: item.name,
    brand: item.brand,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    image: item.image,
  }));

  try {
    const response = await fetch("/api/whatsapp/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerInfo: {
          name: customerName || "Pending - Customer to provide",
          phone: customerPhone || "Pending - Customer to provide",
          email: customerEmail || "",
        },
        items: orderItems,
        subtotal: subtotal,
        total: total,
        customerNotes: `Order from cart. Customer is ${isLoggedIn ? "logged in" : "guest"}. ${
          !customerName ? "Admin needs to collect customer details from WhatsApp chat." : ""
        }`,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const itemLines = orderItems.map(i => `• ${i.name} (${i.size}) x${i.quantity} - AED ${i.price * i.quantity}`).join("\n");
      
      const message = `🏏 *CART ORDER REQUEST*\n\n` +
        `*Order #:* ${data.order.orderNumber}\n\n` +
        `*ITEMS:*\n${itemLines}\n\n` +
        `*Subtotal:* AED ${subtotal.toLocaleString()}\n` +
        (couponApplied ? `*Discount:* -AED ${discount}\n` : "") +
        `*Shipping:* ${shippingCost === 0 ? "FREE" : `AED ${shippingCost}`}\n` +
        `─────────────────\n` +
        `*TOTAL:* AED ${total.toLocaleString()}\n` +
        `*Delivery:* ${delivery === "express" ? "Express Shipping" : "Standard Delivery"}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📝 *Please reply with your details:*\n` +
        `• Full Name:\n` +
        `• Phone Number:\n` +
        `• Delivery Address:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `⚠️ *Admin: Order #${data.order.orderNumber} is pending. Please update customer details and confirm.*`;

      const whatsappUrl = `https://wa.me/971526514666?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      
      showToast("success", "Order Created!", `Order #: ${data.order.orderNumber}. Admin will contact you shortly.`);
    } else {
      showToast("error", "Order Failed", data.error || "Failed to create order. Please try again.");
    }
  } catch (error) {
    console.error("WhatsApp order error:", error);
    showToast("error", "Something went wrong", "Please try again.");
  }
};

  // ── Place order (COD) ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!info.firstName || !info.phone || !info.email || !info.address || !info.city) {
      showToast("warning", "Missing Information", "Please fill in all required fields.");
      return;
    }
    
    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image,
        })),
        customerInfo: info,
        deliveryMethod: delivery,
        paymentMethod: 'cod',
        subtotal: subtotal,
        discount: discount,
        shippingCost: shippingCost,
        total: total,
        couponApplied: couponApplied,
        status: 'PENDING',
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderNumber(data.orderNumber);
        setOrderDetails(orderData);
        await clearCart();
        setStep("confirmed");
        showToast("success", "Order Placed!", `Order #: ${data.orderNumber}`);
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      showToast("error", "Order Failed", "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // Show loading state
  if (isLoading || loadingUserData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  // ── Confirmed screen ──────────────────────────────────────────────────────────
  if (step === "confirmed") {
    const displaySubtotal = orderDetails?.subtotal || subtotal;
    const displayDiscount = orderDetails?.discount || discount;
    const displayShipping = orderDetails?.shippingCost || shippingCost;
    const displayTotal = orderDetails?.total || total;
    const displayItems = orderDetails?.items || cartItems;

    return (
      <div ref={topRef} className="min-h-screen bg-gray-50 pt-[140px] lg:pt-[180px] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 max-w-md w-full mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#81bf42]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-[#81bf42]" strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-500 text-[14px] mb-1">
            Thank you, <strong>{info.firstName || "Customer"}</strong>! Your order has been received.
          </p>
          {orderNumber && (
            <p className="text-[13px] font-bold text-[#004b9c] mb-1">
              Order #{orderNumber}
            </p>
          )}
          <p className="text-gray-400 text-[13px] mb-8">
            A confirmation will be sent to{" "}
            <span className="text-[#004b9c] font-semibold">
              {info.email || "your email"}
            </span>
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Order Summary
            </p>
            {displayItems.map((item: any) => (
              <div
                key={item.productId}
                className="flex justify-between text-[13px] text-gray-700 mb-1.5"
              >
                <span className="truncate max-w-[200px]">
                  {item.name.split(" ").slice(0, 4).join(" ")}… ×{item.quantity}
                </span>
                <span className="font-bold ml-2">AED {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            {displayDiscount > 0 && (
              <div className="flex justify-between text-[13px] text-[#81bf42] mb-1.5">
                <span>Discount (10%)</span>
                <span className="font-bold">-AED {displayDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px] text-gray-500 mb-1.5">
              <span>Shipping</span>
              <span className="font-bold">
                {displayShipping === 0 ? "FREE" : `AED ${displayShipping.toLocaleString()}`}
              </span>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-black text-[#004b9c]">
              <span>Total</span>
              <span>AED {displayTotal.toLocaleString()}</span>
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

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div ref={topRef} className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#004b9c] transition-colors">Home</Link>
          <ChevronRight size={12} />
          {step === "checkout" ? (
            <>
              <button
                onClick={() => setStep("cart")}
                className="hover:text-[#004b9c] transition-colors"
              >
                Cart
              </button>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-semibold">Checkout</span>
            </>
          ) : (
            <span className="text-gray-700 font-semibold">Cart</span>
          )}
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-3 mb-10">
          {["Cart", "Checkout", "Confirmed"].map((s, i) => {
            const stepMap: Record<string, number> = { cart: 0, checkout: 1, confirmed: 2 };
            const current = stepMap[step];
            const active = i <= current;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-200 ${
                      active ? "bg-[#004b9c] text-white" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-[13px] font-bold hidden sm:block ${
                      active ? "text-[#004b9c]" : "text-gray-400"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-[2px] rounded-full transition-all duration-300 ${
                      i < stepMap[step] ? "bg-[#004b9c]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Empty cart ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
            <ShoppingBasket size={64} className="text-gray-200" strokeWidth={1.2} />
            <h2 className="text-2xl font-black text-gray-700 uppercase italic">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-[15px] max-w-sm">
              Let's find you some great cricket gear.
            </p>
            <Link
              href="/shop"
              className="mt-3 flex items-center gap-2 px-8 py-3 rounded-xl bg-[#004b9c] text-white text-[13px] font-black tracking-wider uppercase hover:bg-[#003d82] transition-all shadow-lg"
            >
              BROWSE SHOP <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* LEFT — Cart items OR Checkout form */}
            <div className="xl:col-span-2 flex flex-col gap-5">

              {/* ── CART STEP ── */}
              {step === "cart" && (
                <>
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id + item.size}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-5"
                      >
                        {/* Image / placeholder */}
                        <div className="w-full sm:w-[100px] h-[100px] flex-shrink-0 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[#004b9c] font-black text-[22px] italic">
                              {item.label}
                            </span>
                          )}
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
                              <p className="text-gray-400 text-[12px] mt-0.5">
                                Size: {item.size}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-4 mt-auto pt-2">
                            {/* Qty stepper */}
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
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

                  {subtotal < 500 && (
                    <div className="bg-[#81bf42]/10 border border-[#81bf42]/30 rounded-xl px-5 py-3.5 flex items-center gap-3">
                      <Truck size={18} className="text-[#81bf42] flex-shrink-0" />
                      <p className="text-[13px] text-gray-700 font-semibold">
                        Add{" "}
                        <strong className="text-[#004b9c]">AED {500 - subtotal}</strong>{" "}
                        more to get FREE delivery!
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── CHECKOUT STEP ── */}
              {step === "checkout" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-6"
                >
                  {/* 1. Personal Information */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader number={1} title="Personal Information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={info.firstName}
                          onChange={(e) => handleInfoChange("firstName", e.target.value)}
                          placeholder="Ahmed"
                          className={inputCls}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={info.lastName}
                          onChange={(e) => handleInfoChange("lastName", e.target.value)}
                          placeholder="Al Mansoori"
                          className={inputCls}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={info.phone}
                          onChange={(e) => handleInfoChange("phone", e.target.value)}
                          placeholder="+971 52 XXX XXXX"
                          className={inputCls}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={info.email}
                          onChange={(e) => handleInfoChange("email", e.target.value)}
                          placeholder="you@example.com"
                          className={inputCls}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Shipping Address */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader number={2} title="Shipping Address" />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={info.address}
                          onChange={(e) => handleInfoChange("address", e.target.value)}
                          placeholder="Building, Street, Area"
                          className={inputCls}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            City *
                          </label>
                          <input
                            type="text"
                            value={info.city}
                            onChange={(e) => handleInfoChange("city", e.target.value)}
                            placeholder="Dubai"
                            className={inputCls}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Emirate
                          </label>
                          <input
                            type="text"
                            value={info.emirate}
                            onChange={(e) => handleInfoChange("emirate", e.target.value)}
                            placeholder="Dubai"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order notes */}
                    <div className="flex flex-col gap-1.5 mt-4">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Order Notes (optional)
                      </label>
                      <textarea
                        value={info.notes}
                        onChange={(e) => handleInfoChange("notes", e.target.value)}
                        placeholder="Any special instructions for your order..."
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  </div>

                  {/* 3. Delivery */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader number={3} title="Delivery" />
                    <div className="flex flex-col gap-3">
                      {[
                        {
                          id: "standard" as DeliveryMethod,
                          label: "Standard Delivery",
                          desc: "3–5 business days",
                          price: subtotal >= 500 ? "Free" : "AED 25",
                        },
                        {
                          id: "express" as DeliveryMethod,
                          label: "Express Shipping",
                          desc: "Next business day",
                          price: "AED 50",
                        },
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
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                delivery === opt.id ? "border-[#004b9c]" : "border-gray-300"
                              }`}
                            >
                              {delivery === opt.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#004b9c]" />
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-800">{opt.label}</p>
                              <p className="text-[12px] text-gray-400">{opt.desc}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[14px] font-black ${
                              opt.price === "Free" ? "text-[#81bf42]" : "text-gray-700"
                            }`}
                          >
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

                  {/* 4. Payment - COD Only */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader number={4} title="Payment" />
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-800">Cash on Delivery</p>
                          <p className="text-sm text-green-700 mt-1">
                            Pay when your order arrives. No additional fees.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                      <p className="text-sm text-amber-800">
                        ⚠️ Please have exact change ready as our delivery partners may not carry change.
                      </p>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="mt-6 w-full py-3.5 rounded-xl bg-[#81bf42] hover:bg-[#6ea835] text-white text-[13px] font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {placing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          PLACING ORDER...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          PLACE ORDER (CASH ON DELIVERY)
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT — Order Summary sidebar */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                <h2 className="text-[16px] font-black text-gray-800 uppercase tracking-wider mb-5">
                  Order Summary
                </h2>

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

                {step === "checkout" && (
                  <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-gray-100">
                    {items.map((item) => (
                      <div key={item.id + item.size} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#004b9c] font-black text-[9px] italic">{item.label}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-gray-700 truncate">
                            {item.name.split(" ").slice(0, 4).join(" ")}…
                          </p>
                          <p className="text-[11px] text-gray-400">×{item.qty} · {item.size}</p>
                        </div>
                        <p className="text-[13px] font-black text-[#004b9c] flex-shrink-0">
                          AED {item.price * item.qty}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

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

                {step === "cart" ? (
  <>
    {/* ORDER VIA WHATSAPP BUTTON */}
    <button
      onClick={handleWhatsAppOrder}
      className="mt-6 flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[13px] font-black tracking-wider uppercase transition-all duration-200 shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.45)] active:scale-[0.98]"
    >
      <MessageCircle size={18} />
      ORDER VIA WHATSAPP
    </button>
    
    {/* PROCEED TO CHECKOUT BUTTON */}
    <button
      onClick={() => {
        if (!session?.user) {
          router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }
        setStep("checkout");
      }}
      className="mt-3 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_28px_rgba(0,75,156,0.4)] active:scale-[0.98] transition-all duration-200"
    >
      PROCEED TO CHECKOUT <ArrowRight size={15} />
    </button>
    
    <Link href="/shop" className="mt-3 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:text-[#004b9c] transition-colors py-1">
      ← Continue Shopping
    </Link>
  </>
                ) : (
                  <Link href="/cart" className="mt-3 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:text-[#004b9c] transition-colors py-1 w-full">
                    ← Back to Cart
                  </Link>
                )}

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