// src/components/home/NewArrivals.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star, Loader2 } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  brandId: { name: string; slug: string };
  categoryId: { name: string; slug: string };
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
      className="group"
    >
      <Link href={`/shop/product/${product.slug}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-square bg-gray-50">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                -{discount}%
              </div>
            )}
            <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              NEW
            </div>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold text-[#81bf42] uppercase tracking-wider mb-1">
              {product.brandId?.name}
            </p>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#004b9c] transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    fill={s <= (product.rating || 0) ? "#ffd700" : "#e2e8f0"}
                    className="text-transparent"
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">
                ({product.reviewCount || 0})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-[#004b9c]">
                  AED {product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-[11px] text-gray-400 line-through ml-2">
                      AED {product.originalPrice.toLocaleString()}
                    </span>
                  )}
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#004b9c] group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/home/new-arrivals");
        const json = await res.json();
        if (json.success) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 lg:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex justify-center">
          <Loader2 size={40} className="animate-spin text-[#004b9c]" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative w-full bg-white py-12 lg:py-24 font-['Poppins',_sans-serif]">
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
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-[#81bf42]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#81bf42]">
                Fresh Arrivals
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Just Landed <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b9c] to-[#002f6c]">
                New Cricket Collection
              </span>
            </h2>
            <p className="text-gray-500 text-base mt-6 max-w-lg leading-relaxed">
              Be the first to experience our latest cricket gear. Fresh from top
              brands, these new arrivals are ready to elevate your game to the
              next level.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/shop"
              className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#004b9c] transition-all duration-300 shadow-xl hover:shadow-blue-200"
            >
              Shop New Arrivals
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        {/* Product Grid - 2 columns on mobile, 4-5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 xl:gap-8">
          {products.slice(0, 10).map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
