"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, ArrowRight, Check,
  Sparkles, Flame, Zap, Loader2, MessageCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: "Hot" | "New" | "Best Seller";
  isNew?: boolean;
  inStock?: boolean;
  hasRange?: boolean;
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  rating?: number;
  reviews?: number;
  reviewCount?: number;
}

interface Props {
  product: Product;
  index?: number;
  onAuthRequired?: () => void;
}

export default function ProductCard({ product, index = 0, onAuthRequired }: Props) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  const priceDisplay = product.hasRange && product.priceMin && product.priceMax
    ? `AED ${product.priceMin} – ${product.priceMax}`
    : `AED ${product.price?.toLocaleString() ?? "0"}`;

  const getBadgeIcon = () => {
    if (product.badge === "Hot") return <Flame size={12} className="text-red-500" />;
    if (product.badge === "New") return <Sparkles size={12} className="text-blue-500" />;
    if (product.badge === "Best Seller") return <Zap size={12} className="text-green-500" />;
    return null;
  };

  const getBadgeColor = () => {
    if (product.badge === "Hot") return "text-red-500";
    if (product.badge === "New") return "text-blue-500";
    if (product.badge === "Best Seller") return "text-green-500";
    return "text-gray-700";
  };

  const handleCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      onAuthRequired?.();
      return;
    }

    if (adding || added) return;

    setAdding(true);
    
    await addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand ?? "",
      price: product.price,
      quantity: 1,
      size: product.sizes?.[0] ?? "Standard",
      image: product.image ?? null,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
    setAdding(false);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const message = encodeURIComponent(
      `Hi iSPORTS! I'm interested in the ${product.name} (AED ${product.price}). Can you help me with more details?`
    );
    const whatsappLink = `https://wa.me/971526514666?text=${message}`;
    window.open(whatsappLink, "_blank");
  };

  if (!product) return null;

  const isLoggedIn = !!session?.user;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
      className="h-full"
    >
      <Link href={`/shop/product/${product.id}`} className="group block h-full">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`relative flex flex-col h-full bg-white rounded-3xl transition-all duration-500 overflow-hidden border border-gray-100 ${
            hovered
              ? "shadow-2xl shadow-blue-900/10 -translate-y-2 border-blue-100"
              : "shadow-sm"
          }`}
        >
          <div className="relative aspect-square w-full bg-white p-6 overflow-hidden">
            {discount && discount > 0 && !product.hasRange && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  -{discount}%
                </div>
              </div>
            )}

            {product.badge && (
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                  {getBadgeIcon()}
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${getBadgeColor()}`}>
                    {product.badge}
                  </span>
                </div>
              </div>
            )}

            {product.inStock === false && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-[11px] font-bold px-4 py-2 rounded-full tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}

            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ scale: hovered ? 1.1 : 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.image || "/placeholder-image.jpg"}
                  alt={product.name || "Product image"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </motion.div>
            </div>

            {/* Hover Overlay Buttons */}
            <AnimatePresence>
              {hovered && product.inStock !== false && !product.hasRange && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/80 to-transparent"
                >
                  <div className="flex flex-col gap-2">
                    {/* WhatsApp Button - Show for both logged in and logged out, but different behavior */}
                    <button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-bold tracking-wide uppercase transition-all duration-300 shadow-lg bg-[#25D366] hover:bg-[#1ebe5d]"
                    >
                      <MessageCircle size={14} />
                      Inquire on WhatsApp
                    </button>
                    
                    {/* Add to Cart / Quick Add Button */}
                    <button
                      onClick={handleCart}
                      disabled={adding || added}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-bold tracking-wide uppercase transition-all duration-300 shadow-lg disabled:cursor-not-allowed ${
                        added
                          ? "bg-[#81bf42]"
                          : adding
                          ? "bg-[#004b9c] opacity-80"
                          : "bg-[#004b9c] hover:bg-[#003d7e]"
                      }`}
                    >
                      {adding ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : added ? (
                        <>
                          <Check size={14} strokeWidth={3} />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          {isLoggedIn ? "Quick Add" : "Sign in to Add"}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col flex-grow p-5 pt-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#81bf42]">
                {product.brand || "iSPORTS"}
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
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    strokeWidth={0}
                    fill={s <= Math.floor(product.rating ?? 0) ? "#ffd700" : "#e2e8f0"}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-gray-400">
                ({product.reviews ?? product.reviewCount ?? 0})
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#004b9c] leading-none">
                  {priceDisplay}
                </span>
                {product.originalPrice && product.originalPrice > (product.price ?? 0) && (
                  <span className="text-[11px] text-gray-400 line-through mt-1">
                    AED {product.originalPrice.toLocaleString()}
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