// src/app/shop/product/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBasket,
  ChevronRight,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Zap,
  Award,
  CheckCircle2,
  ArrowRight,
  Heart,
  Loader2,
  QrCode,
  MessageCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import ReviewSection from "@/components/products/ReviewSection";
import { showToast } from "@/components/ui/Toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SizeOption {
  label: string;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQty: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  sizes: string[];
  sizeOptions: SizeOption[];
  enableSizePrice: boolean;
  colors: string[];
  categoryId: { name: string; slug: string };
  brandId: { name: string; slug: string; logo?: string };
  qrCodeId?: string;
  createdAt: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  slug: string;
  originalPrice?: number;
  images: string[];
  brandId: { name: string; slug: string };
}

// ── Static data ────────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: Truck, title: "Free Delivery", desc: "Orders over AED 500" },
  { icon: Shield, title: "100% Authentic", desc: "Genuine products only" },
  { icon: RotateCcw, title: "14-Day Returns", desc: "Hassle-free returns" },
  { icon: Award, title: "Expert Advice", desc: "24/7 cricket support" },
];

const COLOR_HEX: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#EF4444",
  Blue: "#3B82F6",
  Navy: "#1E3A5F",
  Green: "#22C55E",
  Yellow: "#EAB308",
  Gray: "#6B7280",
  Gold: "#D97706",
  Maroon: "#7F1D1D",
};

type TabType = "description" | "specs" | "reviews";

export default function ProductDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  // Detect if visitor arrived via QR scan (the redirect sets ?via=qr)
  const viaQr = searchParams.get("via") === "qr";

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | string | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [qrBannerVisible, setQrBannerVisible] = useState(viaQr);
  const [whatsappOrderLoading, setWhatsappOrderLoading] = useState(false);

  // Auto-hide QR banner after 5 s
  useEffect(() => {
    if (!qrBannerVisible) return;
    const t = setTimeout(() => setQrBannerVisible(false), 5000);
    return () => clearTimeout(t);
  }, [qrBannerVisible]);

  // Fetch product
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/shop/products/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const p: Product = json.data.product;
          setProduct(p);
          setRelated(json.data.relatedProducts ?? []);
          if (p.enableSizePrice && p.sizeOptions?.length > 0)
            setSelectedSize(p.sizeOptions[0]);
          else if (p.sizes?.length > 0) setSelectedSize(p.sizes[0]);
          if (p.colors?.length > 0) setSelectedColor(p.colors[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    // Get the size value safely
    let sizeValue = "Standard";
    if (selectedSize) {
      sizeValue =
        typeof selectedSize === "object" ? selectedSize.label : selectedSize;
    }

    // Calculate final price
    let finalPrice = product.price;
    if (
      product.enableSizePrice &&
      selectedSize &&
      typeof selectedSize === "object"
    ) {
      finalPrice = selectedSize.price;
    }

    // Add to cart using the context (works for guests too!)
    addToCart({
      productId: product._id,
      name: product.name,
      brand: product.brandId?.name || "",
      price: finalPrice,
      quantity: qty,
      size: sizeValue,
      image: product.images?.[0] || null,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
    showToast(
      "success",
      "Added to Cart!",
      `${product.name} added to your cart`,
    );
  };

  // Handle WhatsApp Order - Creates order in database then opens WhatsApp
  // Handle WhatsApp Order - Creates order in database for ALL users (guest or logged in)
  const handleWhatsAppOrder = async () => {
    if (!product) return;

    setWhatsappOrderLoading(true);

    // Get size value
    let sizeValue = "Standard";
    if (selectedSize) {
      sizeValue =
        typeof selectedSize === "object" ? selectedSize.label : selectedSize;
    }

    // Calculate final price
    let finalPrice = product.price;
    if (
      product.enableSizePrice &&
      selectedSize &&
      typeof selectedSize === "object"
    ) {
      finalPrice = selectedSize.price;
    }

    // Prepare customer info (empty for guests, admin will fill later)
    let customerName = "";
    let customerPhone = "";
    let customerEmail = "";
    let isLoggedIn = false;

    if (session?.user) {
      isLoggedIn = true;
      customerName = session.user.name || "";
      customerPhone = (session.user as any)?.phone || "";
      customerEmail = session.user.email || "";

      // Fetch latest user data
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

    const orderItems = [
      {
        productId: product._id,
        name: product.name,
        brand: product.brandId?.name || "",
        price: finalPrice,
        quantity: qty,
        size: sizeValue,
        image: product.images?.[0],
      },
    ];

    try {
      // Create order in database (even for guests)
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
          subtotal: finalPrice * qty,
          total: finalPrice * qty,
          customerNotes: `Product order from product page: ${product.name} (${sizeValue}) x${qty}. Customer is ${isLoggedIn ? "logged in" : "guest"}. ${
            !customerName
              ? "Admin needs to collect customer name and phone from WhatsApp chat."
              : ""
          }`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Build WhatsApp message
        const message =
          `🏏 *PRODUCT ORDER REQUEST*\n\n` +
          `*Order #:* ${data.order.orderNumber}\n\n` +
          `*Product:* ${product.name}\n` +
          `*Size:* ${sizeValue}\n` +
          `*Color:* ${selectedColor || "N/A"}\n` +
          `*Quantity:* ${qty}\n` +
          `*Price:* AED ${(finalPrice * qty).toLocaleString()}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📝 *Please reply with your details:*\n` +
          `• Full Name:\n` +
          `• Phone Number:\n` +
          `• Delivery Address:\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `*Product Link:* ${window.location.href}\n\n` +
          `⚠️ *Admin: Order #${data.order.orderNumber} is pending. Please update customer details and confirm.*`;

        const whatsappUrl = `https://wa.me/94764078448?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

        showToast(
          "success",
          "Order Created!",
          `Order #: ${data.order.orderNumber}. Admin will contact you shortly.`,
        );
      } else {
        showToast(
          "error",
          "Order Failed",
          data.error || "Failed to create order. Please try again.",
        );
      }
    } catch (error) {
      console.error("WhatsApp order error:", error);
      showToast("error", "Something went wrong", "Please try again later.");
    } finally {
      setWhatsappOrderLoading(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Product not found</p>
        <Link
          href="/shop"
          className="text-[#004b9c] hover:underline font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    );

  // ── Derived values ─────────────────────────────────────────────────────────
  const images =
    product.images?.length > 0 ? product.images : ["/placeholder-product.jpg"];

  const displayPrice =
    product.enableSizePrice && selectedSize && typeof selectedSize === "object"
      ? (selectedSize as SizeOption).price
      : product.price;

  const savings =
    product.originalPrice && product.originalPrice > displayPrice
      ? product.originalPrice - displayPrice
      : 0;

  const discountPct =
    product.originalPrice && product.originalPrice > displayPrice
      ? Math.round((1 - displayPrice / product.originalPrice) * 100)
      : 0;

  const hasSizeOptions =
    product.enableSizePrice && product.sizeOptions?.length > 0;
  const hasSimpleSizes = !hasSizeOptions && product.sizes?.length > 0;
  const hasSizes = hasSizeOptions || hasSimpleSizes;
  const hasColors = product.colors?.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* ── QR Scan Banner ────────────────────────────────────────────── */}
      <AnimatePresence>
        {qrBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,75,156,0.22)] border border-[#004b9c]/20"
            style={{
              background: "linear-gradient(135deg, #004b9c 0%, #0062cc 100%)",
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <QrCode size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-[13px] font-black leading-none">
                Scanned Successfully!
              </p>
              <p className="text-blue-200 text-[11px] mt-0.5">
                You scanned the QR label for this product.
              </p>
            </div>
            <button
              onClick={() => setQrBannerVisible(false)}
              className="ml-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <span className="text-white text-[10px] font-bold">✕</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-6">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:text-[#004b9c] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-[#004b9c] transition-colors">
            Shop
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/category/${product.categoryId?.slug}`}
            className="hover:text-[#004b9c] transition-colors"
          >
            {product.categoryId?.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-semibold truncate max-w-[180px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-4"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square border border-gray-100">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discountPct > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black tracking-[0.12em] px-3 py-1.5 rounded-full uppercase">
                    SAVE {discountPct}%
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-[#81bf42] text-white text-[10px] font-black tracking-[0.12em] px-3 py-1.5 rounded-full uppercase">
                    BEST SELLER
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-[#004b9c] text-white text-[10px] font-black tracking-[0.12em] px-3 py-1.5 rounded-full uppercase">
                    NEW ARRIVAL
                  </span>
                )}
                {/* QR scanned pill */}
                {viaQr && (
                  <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#004b9c] text-[10px] font-black tracking-[0.08em] px-2.5 py-1.5 rounded-full border border-[#004b9c]/20 uppercase shadow-sm">
                    <QrCode size={10} /> QR Scan
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all"
              >
                <Heart
                  size={18}
                  className={
                    wishlist ? "fill-red-500 text-red-500" : "text-gray-400"
                  }
                  strokeWidth={1.8}
                />
              </button>

              <img
                src={images[activeImage]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain p-6"
              />

              {product.stockQty <= 8 && product.stockQty > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2 border border-red-100">
                  <Zap
                    size={14}
                    className="text-red-500 flex-shrink-0"
                    fill="currentColor"
                  />
                  <p className="text-[12px] font-bold text-red-600">
                    Only {product.stockQty} left — order soon!
                  </p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative rounded-xl overflow-hidden aspect-square bg-gray-50 border-2 transition-all ${
                      activeImage === i
                        ? "border-[#004b9c] shadow-[0_0_0_3px_rgba(0,75,156,0.12)]"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-[3px] bg-[#81bf42] rounded-full" />
                <span className="text-[#81bf42] text-[11px] font-black tracking-[0.18em] uppercase">
                  {product.brandId?.name} · {product.categoryId?.name}
                </span>
              </div>
              <h1 className="text-3xl lg:text-[2.1rem] font-black text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(product.rating ?? 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                  <span className="text-[13px] font-black text-gray-800 ml-1">
                    {product.rating ?? 0}
                  </span>
                </div>
                <span className="text-[13px] text-gray-400">
                  ({product.reviewCount ?? 0} verified reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayPrice}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-baseline gap-3 flex-wrap"
                >
                  <span className="text-4xl font-black text-[#004b9c]">
                    AED {displayPrice.toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > displayPrice && (
                      <>
                        <span className="text-[18px] text-gray-300 line-through font-medium">
                          AED {product.originalPrice.toLocaleString()}
                        </span>
                        <span className="bg-[#81bf42] text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                          SAVE AED {savings.toLocaleString()}
                        </span>
                      </>
                    )}
                </motion.div>
              </AnimatePresence>
              {hasSizeOptions && (
                <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 size={11} className="text-[#004b9c]" />
                  Price varies by size — select a size to see exact price
                </p>
              )}
              <p className="text-gray-400 text-[12px] mt-1.5">
                Inclusive of VAT · Free delivery on orders over AED 500
              </p>
            </div>

            {/* Sizes */}
            {hasSizes && (
              <div>
                <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider mb-3">
                  Select Size
                  {hasSizeOptions &&
                    selectedSize &&
                    typeof selectedSize === "object" && (
                      <span className="ml-2 font-normal normal-case tracking-normal text-[#004b9c]">
                        — AED{" "}
                        {(selectedSize as SizeOption).price.toLocaleString()}
                      </span>
                    )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hasSizeOptions
                    ? product.sizeOptions.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setSelectedSize(opt)}
                          className={`px-4 py-2.5 rounded-xl border-2 text-[13px] font-black transition-all duration-150 ${
                            typeof selectedSize === "object" &&
                            (selectedSize as SizeOption).label === opt.label
                              ? "border-[#004b9c] bg-[#004b9c] text-white shadow-[0_4px_14px_rgba(0,75,156,0.28)]"
                              : "border-gray-200 text-gray-600 hover:border-[#004b9c] hover:text-[#004b9c]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span
                            className={`block text-[10px] font-semibold mt-0.5 ${typeof selectedSize === "object" && (selectedSize as SizeOption).label === opt.label ? "text-white/80" : "text-gray-400"}`}
                          >
                            AED {opt.price.toLocaleString()}
                          </span>
                        </button>
                      ))
                    : product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-5 py-2.5 rounded-xl border-2 text-[13px] font-black transition-all duration-150 ${
                            selectedSize === s
                              ? "border-[#004b9c] bg-[#004b9c] text-white shadow-[0_4px_14px_rgba(0,75,156,0.28)]"
                              : "border-gray-200 text-gray-600 hover:border-[#004b9c] hover:text-[#004b9c]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {hasColors && (
              <div>
                <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider mb-3">
                  Select Colour
                  {selectedColor && (
                    <span className="ml-2 font-normal normal-case tracking-normal text-gray-500">
                      — {selectedColor}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => {
                    const hex = COLOR_HEX[c] || "#e5e7eb";
                    const isSelected = selectedColor === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[12.5px] font-bold transition-all duration-150 ${
                          isSelected
                            ? "border-[#004b9c] bg-[#004b9c]/5 text-[#004b9c]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        {c}
                        {isSelected && (
                          <CheckCircle2 size={12} className="text-[#004b9c]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + Actions */}
            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                Quantity
              </p>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-[16px] font-black text-gray-800">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#004b9c] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart button with auth check */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.35)] active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* WhatsApp Order Button - UPDATED to create order in database */}
              <button
                onClick={handleWhatsAppOrder}
                disabled={whatsappOrderLoading || !product.inStock}
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-black tracking-wider uppercase active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                {whatsappOrderLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <MessageCircle size={16} />
                    ORDER VIA WHATSAPP
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_BADGES.map((b) => (
                <div
                  key={b.title}
                  className="flex flex-col items-center text-center gap-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <b.icon
                    size={18}
                    className="text-[#004b9c]"
                    strokeWidth={1.8}
                  />
                  <p className="text-[11px] font-black text-gray-700 uppercase tracking-wide leading-tight">
                    {b.title}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description / Specs / Reviews Tabs */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
          {/* Tab Buttons */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit mb-10">
            {(["description", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[#004b9c] text-white shadow-[0_4px_12px_rgba(0,75,156,0.28)]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "description"
                  ? "Product Description"
                  : tab === "specs"
                    ? "Specifications"
                    : "Reviews"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Description Tab */}
            {activeTab === "description" && (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description || "No description available."}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specs" && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-2 gap-5 p-6">
                    {[
                      { label: "Brand", value: product.brandId?.name },
                      { label: "Category", value: product.categoryId?.name },
                      {
                        label: "Stock",
                        value: product.inStock ? "In Stock" : "Out of Stock",
                        cls: product.inStock
                          ? "text-green-600"
                          : "text-red-600",
                      },
                      product.sizes?.length > 0 && !product.enableSizePrice
                        ? {
                            label: "Available Sizes",
                            value: product.sizes.join(", "),
                          }
                        : null,
                      product.sizeOptions?.length > 0 && product.enableSizePrice
                        ? {
                            label: "Sizes & Prices",
                            value: product.sizeOptions
                              .map((s) => `${s.label} (AED ${s.price})`)
                              .join(", "),
                          }
                        : null,
                      product.colors?.length > 0
                        ? {
                            label: "Colours",
                            value: product.colors.join(", "),
                          }
                        : null,
                      {
                        label: "SKU",
                        value: product._id.slice(-8).toUpperCase(),
                      },
                    ]
                      .filter(Boolean)
                      .map((row, i) => (
                        <div key={i} className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            {row!.label}
                          </span>
                          <span
                            className={`text-[14px] font-semibold text-gray-800 ${(row as { cls?: string }).cls ?? ""}`}
                          >
                            {row!.value}
                          </span>
                        </div>
                      ))}
                  </div>
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
              >
                <ReviewSection
                  productId={product._id}
                  productName={product.name}
                  initialRating={product.rating}
                  initialReviewCount={product.reviewCount}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-[3px] bg-[#81bf42] rounded-full" />
            <span className="text-[#81bf42] text-[11px] font-black tracking-[0.18em] uppercase">
              You May Also Like
            </span>
          </div>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
              Related Products
            </h2>
            <Link
              href="/shop"
              className="text-[13px] font-black text-[#004b9c] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((r) => (
              <Link key={r._id} href={`/shop/product/${r.slug}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(0,75,156,0.1)] hover:border-[#004b9c]/20 transition-all duration-300 group cursor-pointer">
                  <div className="relative aspect-square bg-gray-50">
                    <img
                      src={r.images?.[0] ?? "/placeholder-product.jpg"}
                      alt={r.name}
                      className="absolute inset-0 w-full h-full object-contain p-3"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-black text-[#81bf42] tracking-[0.15em] uppercase mb-1">
                      {r.brandId?.name}
                    </p>
                    <h3 className="text-gray-800 font-bold text-[14px] leading-snug mb-3 group-hover:text-[#004b9c] transition-colors line-clamp-2">
                      {r.name}
                    </h3>
                    <span className="text-[#004b9c] font-black text-[16px]">
                      AED {r.price.toLocaleString()}
                    </span>
                    {r.originalPrice && r.originalPrice > r.price && (
                      <span className="text-gray-300 text-[12px] line-through ml-2">
                        AED {r.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
