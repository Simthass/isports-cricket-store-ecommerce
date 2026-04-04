// src/app/(shop)/product/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Heart,
  Loader2,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQty: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  sizes: string[];
  categoryId: { name: string; slug: string };
  brandId: { name: string; slug: string; logo?: string };
  createdAt: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  brandId: { name: string; slug: string };
}

const TRUST_BADGES = [
  { icon: Truck, title: "Free Delivery", desc: "Orders over AED 500" },
  { icon: Shield, title: "100% Authentic", desc: "Genuine products only" },
  { icon: RotateCcw, title: "14-Day Returns", desc: "Hassle-free returns" },
  { icon: Award, title: "Expert Advice", desc: "24/7 cricket support" },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs">(
    "description",
  );
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/shop/products/${slug}`);
        const json = await res.json();
        if (json.success) {
          setProduct(json.data.product);
          setRelatedProducts(json.data.relatedProducts);
          if (json.data.product.sizes?.length > 0) {
            setSelectedSize(json.data.product.sizes[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const savings = product?.originalPrice
    ? product.originalPrice - product.price
    : 0;
  const whatsappMsg = product
    ? encodeURIComponent(
        `Hi iSPORTS! I'm interested in the ${product.name}${selectedSize ? ` (${selectedSize})` : ""}. Can you help me?`,
      )
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Product not found</p>
        <Link href="/shop" className="text-[#004b9c] hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const productImages =
    product.images?.length > 0 ? product.images : ["/placeholder-product.jpg"];

  return (
    <div className="min-h-screen bg-white font-poppins">
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

      {/* Main Product Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* LEFT: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center border border-gray-100">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="bg-red-500 text-white text-[10px] font-black tracking-[0.15em] px-3 py-1.5 rounded-full uppercase">
                      SAVE{" "}
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )}
                      %
                    </span>
                  )}
                {product.isBestSeller && (
                  <span className="bg-[#81bf42] text-white text-[10px] font-black tracking-[0.15em] px-3 py-1.5 rounded-full uppercase">
                    BEST SELLER
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-[#004b9c] text-white text-[10px] font-black tracking-[0.15em] px-3 py-1.5 rounded-full uppercase">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200"
              >
                <Heart
                  size={18}
                  className={
                    wishlist ? "fill-red-500 text-red-500" : "text-gray-400"
                  }
                  strokeWidth={1.8}
                />
              </button>

              {/* Product Image */}
              <div className="relative w-full h-full p-8">
                <Image
                  src={productImages[activeImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Stock urgency */}
              {product.stockQty <= 8 && product.stockQty > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2 border border-red-100">
                  <Zap
                    size={14}
                    className="text-red-500 flex-shrink-0"
                    fill="currentColor"
                  />
                  <p className="text-[12px] font-bold text-red-600">
                    Only {product.stockQty} left in stock — order soon!
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative rounded-xl overflow-hidden aspect-square bg-gray-50 flex items-center justify-center border-2 transition-all duration-150 ${
                      activeImage === i
                        ? "border-[#004b9c] shadow-[0_0_0_3px_rgba(0,75,156,0.15)]"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Product Info */}
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
                  {product.brandId?.name} · {product.categoryId?.name}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < Math.floor(product.rating || 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                  <span className="text-[13px] font-black text-gray-800 ml-1">
                    {product.rating || 0}
                  </span>
                </div>
                <span className="text-[13px] text-gray-400">
                  ({product.reviewCount || 0} verified reviews)
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-black text-[#004b9c]">
                  AED {product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-[18px] text-gray-300 line-through font-medium">
                        AED {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-[#81bf42] text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                        SAVE AED {savings}
                      </span>
                    </>
                  )}
              </div>
              <p className="text-gray-400 text-[12px] mt-1.5">
                Inclusive of VAT · Free delivery on orders over AED 500
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                    Select Size
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
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
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                Quantity
              </p>
              <div className="flex gap-3 flex-wrap">
                {/* Qty control */}
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

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-black tracking-wider uppercase shadow-[0_4px_20px_rgba(0,75,156,0.35)] hover:shadow-[0_8px_32px_rgba(0,75,156,0.45)] active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/971526514666?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-black tracking-wider uppercase transition-all duration-200 active:scale-[0.97]"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.title}
                    className="flex flex-col items-center text-center gap-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100"
                  >
                    <Icon
                      size={18}
                      className="text-[#004b9c]"
                      strokeWidth={1.8}
                    />
                    <p className="text-[11px] font-black text-gray-700 uppercase tracking-wide leading-tight">
                      {badge.title}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {badge.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description Tab */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
          {/* Tab Nav */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit mb-10">
            {(["description", "specs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[#004b9c] text-white shadow-[0_4px_12px_rgba(0,75,156,0.3)]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "description"
                  ? "Product Description"
                  : "Specifications"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "description" && (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="prose prose-sm max-w-none"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description || "No description available."}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "specs" && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider">
                        Brand
                      </span>
                      <span className="text-[14px] font-semibold text-gray-800">
                        {product.brandId?.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider">
                        Category
                      </span>
                      <span className="text-[14px] font-semibold text-gray-800">
                        {product.categoryId?.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider">
                        Stock Status
                      </span>
                      <span
                        className={`text-[14px] font-semibold ${product.inStock ? "text-green-600" : "text-red-600"}`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider">
                          Available Sizes
                        </span>
                        <span className="text-[14px] font-semibold text-gray-800">
                          {product.sizes.join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-wider">
                        SKU
                      </span>
                      <span className="text-[14px] font-semibold text-gray-800">
                        {product._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
            <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">
              You May Also Like
            </span>
          </div>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
              Related Products
            </h2>
            <Link
              href="/shop"
              className="text-[13px] font-black text-[#004b9c] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((related, i) => (
              <Link key={related._id} href={`/product/${related.slug}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(0,75,156,0.1)] hover:border-[#004b9c]/20 transition-all duration-300 group cursor-pointer">
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-4">
                    <Image
                      src={related.images?.[0] || "/placeholder-product.jpg"}
                      alt={related.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-black text-[#81bf42] tracking-[0.15em] uppercase mb-1">
                      {related.brandId?.name}
                    </p>
                    <h3 className="text-gray-800 font-bold text-[14px] leading-snug mb-3 group-hover:text-[#004b9c] transition-colors line-clamp-2">
                      {related.name}
                    </h3>
                    <div>
                      <span className="text-[#004b9c] font-black text-[16px]">
                        AED {related.price.toLocaleString()}
                      </span>
                      {related.originalPrice &&
                        related.originalPrice > related.price && (
                          <span className="text-gray-300 text-[12px] line-through ml-2">
                            AED {related.originalPrice.toLocaleString()}
                          </span>
                        )}
                    </div>
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
