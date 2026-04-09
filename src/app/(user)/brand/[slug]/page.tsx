"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Layers,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ShopHeader from "@/components/products/ShopHeader";

// ── Types ─────────────────────────────────────────────────────
interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
}

interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
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
  categoryId: { name: string; slug: string };
  brandId: { name: string; slug: string; logo?: string };
}

interface BrandFilters {
  categories: string[];
  priceRange: { min: number; max: number } | null;
  inStockOnly: boolean;
}

const PRICE_RANGES = [
  { label: "Under AED 250", min: 0, max: 250 },
  { label: "AED 250 – AED 500", min: 250, max: 500 },
  { label: "AED 500 – AED 1000", min: 500, max: 1000 },
  { label: "AED 1000 – AED 2000", min: 1000, max: 2000 },
  { label: "AED 2000+", min: 2000, max: 10000 },
];

const DEFAULT_FILTERS: BrandFilters = {
  categories: [],
  priceRange: null,
  inStockOnly: false,
};

// ── Section Component ─────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <span className="text-[13px] font-bold text-gray-800 tracking-wide uppercase">
          {title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            size={14}
            className="text-gray-400 group-hover:text-gray-600"
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Brand Filter Sidebar (categories + price + stock only) ────
function BrandFilterSidebar({
  filters,
  onChange,
  totalResults,
  categories,
}: {
  filters: BrandFilters;
  onChange: (f: BrandFilters) => void;
  totalResults: number;
  categories: NavCategory[];
}) {
  const activeCount =
    filters.categories.length +
    (filters.priceRange ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  const reset = () => onChange(DEFAULT_FILTERS);

  const toggleCat = (slug: string) => {
    const arr = filters.categories;
    onChange({
      ...filters,
      categories: arr.includes(slug)
        ? arr.filter((v) => v !== slug)
        : [...arr, slug],
    });
  };

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#004b9c]" />
          <span className="text-[14px] font-bold text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-[#004b9c] text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={11} />
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="bg-[#f0f5ff] rounded-xl px-4 py-3 mb-6">
        <p className="text-[12px] text-gray-500">Showing</p>
        <p className="text-[18px] font-black text-[#004b9c]">
          {totalResults}{" "}
          <span className="text-[13px] font-medium text-gray-500">
            products
          </span>
        </p>
      </div>

      {/* In Stock Toggle */}
      <div className="border-b border-gray-100 pb-5 mb-5">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-[13px] font-bold text-gray-800 tracking-wide uppercase">
            In Stock Only
          </span>
          <div
            onClick={() =>
              onChange({ ...filters, inStockOnly: !filters.inStockOnly })
            }
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              filters.inStockOnly ? "bg-[#81bf42]" : "bg-gray-200"
            }`}
          >
            <motion.div
              animate={{ x: filters.inStockOnly ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
        </label>
      </div>

      {/* Categories */}
      <Section title="Category">
        <div className="flex flex-col gap-1">
          {categories.map((cat) => {
            const active = filters.categories.includes(cat.slug);
            return (
              <button
                key={cat._id}
                onClick={() => toggleCat(cat.slug)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left ${
                  active
                    ? "bg-[#004b9c]/8 text-[#004b9c] font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? "bg-[#004b9c] border-[#004b9c]" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <polyline
                        points="1 4 3 6 7 2"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Price Range">
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((range) => {
            const active =
              filters.priceRange?.min === range.min &&
              filters.priceRange?.max === range.max;
            return (
              <button
                key={range.label}
                onClick={() =>
                  onChange({
                    ...filters,
                    priceRange: active
                      ? null
                      : { min: range.min, max: range.max },
                  })
                }
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left ${
                  active
                    ? "bg-[#81bf42]/10 text-[#5a8f2a] font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? "bg-[#81bf42] border-[#81bf42]" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </span>
                {range.label}
              </button>
            );
          })}
        </div>
      </Section>
    </aside>
  );
}

// ── Main Brand Page ───────────────────────────────────────────
export default function BrandPage() {
  const params = useParams();
  const brandSlug = params.slug as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [categories, setCategories] = useState<NavCategory[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [filters, setFilters] = useState<BrandFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const isFirstRender = useRef(true);

  // Fetch brand details + categories once
  useEffect(() => {
    setBrandLoading(true);
    Promise.all([
      fetch(`/api/shop/brands/${brandSlug}`).then((r) => r.json()),
      fetch("/api/shop/nav-data").then((r) => r.json()),
    ])
      .then(([brandJson, navJson]) => {
        if (brandJson.success) setBrand(brandJson.data);
        if (navJson.success) setCategories(navJson.data.categories);
      })
      .finally(() => setBrandLoading(false));
  }, [brandSlug]);

  // Fetch products whenever filters/sort/page changes
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("brand", brandSlug);
      p.set("page", pagination.page.toString());
      p.set("limit", "12");
      p.set("sort", sort);

      if (filters.categories.length > 0)
        p.set("category", filters.categories[0]);
      if (filters.priceRange) {
        p.set("minPrice", filters.priceRange.min.toString());
        p.set("maxPrice", filters.priceRange.max.toString());
      }
      if (filters.inStockOnly) p.set("inStock", "true");

      const res = await fetch(`/api/shop/products?${p}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Error fetching brand products:", err);
    } finally {
      setProductsLoading(false);
    }
  }, [brandSlug, pagination.page, sort, filters]);

  useEffect(() => {
    if (!brandLoading) fetchProducts();
  }, [fetchProducts, brandLoading]);

  const handleFiltersChange = (newFilters: BrandFilters) => {
    if (!isFirstRender.current) setPagination((p) => ({ ...p, page: 1 }));
    isFirstRender.current = false;
    setFilters(newFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    (filters.priceRange ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg font-semibold">Brand not found</p>
        <Link href="/shop" className="text-[#004b9c] hover:underline font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* ── Brand Hero ── */}
        <div className="bg-gradient-to-br from-[#f0f5ff] via-white to-[#f5faf0] border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-10 lg:py-14">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-6">
              <Link href="/" className="hover:text-[#004b9c] transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <Link
                href="/shop"
                className="hover:text-[#004b9c] transition-colors"
              >
                Shop
              </Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-medium">{brand.name}</span>
            </div>

            {/* Brand Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Logo */}
              <div className="w-[140px] h-[140px] bg-white rounded-2xl border border-gray-200 shadow-[0_8px_32px_rgba(0,75,156,0.1)] flex items-center justify-center p-4 flex-shrink-0">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={110}
                    height={110}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-xl bg-[#004b9c]/10 flex items-center justify-center">
                      <Layers size={28} className="text-[#004b9c]" />
                    </div>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      No Logo
                    </span>
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <div className="w-5 h-[3px] bg-[#81bf42] rounded-full" />
                  <span className="text-[#81bf42] text-[11px] font-black tracking-[0.18em] uppercase">
                    Official Brand Store
                    {brand.country ? ` · ${brand.country}` : ""}
                  </span>
                </div>
                <h1
                  className="text-[36px] lg:text-[48px] font-black text-gray-900 leading-none tracking-tight mb-2"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {brand.name}
                </h1>
                <p className="text-gray-500 text-[14px]">
                  Browse all{" "}
                  <span className="font-semibold text-gray-700">
                    {pagination.total} products
                  </span>{" "}
                  from {brand.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[240px] xl:w-[260px] flex-shrink-0">
              <div className="sticky top-[120px]">
                <BrandFilterSidebar
                  filters={filters}
                  onChange={handleFiltersChange}
                  totalResults={pagination.total}
                  categories={categories}
                />
              </div>
            </aside>

            {/* Products Area */}
            <div className="flex-1 min-w-0">
              {/* Header bar */}
              <div className="flex items-center gap-3 mb-0">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-[#004b9c] hover:text-[#004b9c] transition-all bg-white"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 bg-[#004b9c] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div className="flex-1">
                  <ShopHeader
                    total={pagination.total}
                    sort={sort}
                    onSort={setSort}
                    view={view}
                    onView={setView}
                  />
                </div>
              </div>

              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {filters.categories.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1.5 bg-[#004b9c]/10 text-[#004b9c] text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize"
                    >
                      {c}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            categories: filters.categories.filter(
                              (x) => x !== c,
                            ),
                          })
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {filters.inStockOnly && (
                    <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                      In Stock
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            inStockOnly: false,
                          })
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Product Grid */}
              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-100 rounded-2xl aspect-square mb-3" />
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-6xl mb-4">🏏</div>
                  <h3 className="text-[18px] font-bold text-gray-700 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-400 text-[14px] mb-6">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={() => handleFiltersChange(DEFAULT_FILTERS)}
                    className="px-6 py-3 bg-[#004b9c] text-white text-[13px] font-bold rounded-xl hover:bg-[#003d82] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                      : "flex flex-col gap-4"
                  }
                >
                  {products.map((product, i) => (
                    <ProductCard
                      key={product._id}
                      product={{
                        id: product._id,
                        name: product.name,
                        brand: product.brandId?.name ?? brand.name ?? "iSPORTS",
                        slug: product.slug,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        image:
                          product.images?.[0] ?? "/placeholder-product.jpg",
                        isNew: product.isNew,
                        inStock: product.inStock,
                        badge: product.isBestSeller
                          ? "Best Seller"
                          : product.isNew
                            ? "New"
                            : undefined,
                        rating: product.rating,
                        reviewCount: product.reviewCount,
                      }}
                      index={i}
                      onAuthRequired={() => {
                        setAuthMode("login");
                        setAuthModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                  <p className="text-[12px] text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page - 1,
                        })
                      }
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilterOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 left-0 z-50 w-[300px] h-full bg-white shadow-2xl overflow-y-auto lg:hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <span className="text-[15px] font-bold text-gray-900">
                    Filters
                  </span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <BrandFilterSidebar
                    filters={filters}
                    onChange={handleFiltersChange}
                    totalResults={pagination.total}
                    categories={categories}
                  />
                </div>
                <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-3 bg-[#004b9c] text-white text-[13px] font-bold rounded-xl hover:bg-[#003d82] transition-colors"
                  >
                    Show {pagination.total} Products
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
