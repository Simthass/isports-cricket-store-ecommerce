// src/components/products/ProductCard.tsx
"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Star,
  ArrowRight,
  Check,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  categoryId: { name: string; slug: string };
  brandId: { name: string; slug: string; logo?: string };
}

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getBadgeIcon = () => {
    if (product.isBestSeller)
      return <Zap size={12} className="text-green-500" />;
    if (product.isNew) return <Sparkles size={12} className="text-blue-500" />;
    return null;
  };

  const getBadgeText = () => {
    if (product.isBestSeller) return "Best Seller";
    if (product.isNew) return "New";
    return null;
  };

  const getBadgeColor = () => {
    if (product.isBestSeller) return "text-green-500";
    if (product.isNew) return "text-blue-500";
    return "text-gray-700";
  };

  const productImage = product.images?.[0] || "/placeholder-product.jpg";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
      className="h-full"
    >
      <Link
        href={`/shop/product/${product.slug}`}
        className="group block h-full"
      >
        {" "}
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
            {/* Discount Badge */}
            {discount && discount > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  -{discount}%
                </div>
              </div>
            )}

            {/* Product Badge */}
            {getBadgeText() && (
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                  {getBadgeIcon()}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${getBadgeColor()}`}
                  >
                    {getBadgeText()}
                  </span>
                </div>
              </div>
            )}

            {/* Stock badge */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-[11px] font-bold px-4 py-2 rounded-full tracking-wider">
                  Out of Stock
                </span>
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
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </motion.div>
            </div>

            {/* Quick Add Overlay */}
            <AnimatePresence>
              {hovered && product.inStock && (
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
                {product.brandId?.name || "Brand"}
              </span>
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
                    fill={
                      s <= Math.floor(product.rating || 0)
                        ? "#ffd700"
                        : "#e2e8f0"
                    }
                    className="transition-colors duration-200"
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-gray-400">
                ({product.reviewCount || 0})
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#004b9c] leading-none">
                  AED {product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
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
