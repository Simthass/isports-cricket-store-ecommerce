"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import FilterSidebar from "@/components/products/FilterSidebar";
import ShopHeader from "@/components/products/ShopHeader";
import AuthModal from "@/components/auth/AuthModal";

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

interface Filters {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number } | null;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  brands: [],
  priceRange: null,
  inStockOnly: false,
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Read URL params to pre-populate filters ────────────────
  const initialFilters: Filters = {
    categories: searchParams.get("category")
      ? [searchParams.get("category")!]
      : [],
    brands: searchParams.get("brand") ? [searchParams.get("brand")!] : [],
    priceRange: null,
    inStockOnly: false,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuthRequired = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", "12");
      params.set("sort", sort);

      if (filters.categories.length > 0) {
        params.set("category", filters.categories[0]);
      }
      if (filters.brands.length > 0) {
        params.set("brand", filters.brands[0]);
      }
      if (filters.priceRange) {
        params.set("minPrice", filters.priceRange.min.toString());
        params.set("maxPrice", filters.priceRange.max.toString());
      }
      if (filters.inStockOnly) {
        params.set("inStock", "true");
      }

      const res = await fetch(`/api/shop/products?${params}`);
      const json = await res.json();

      if (json.success) {
        setProducts(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, sort, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 whenever filters/sort change (but not on first render)
  const handleFiltersChange = (newFilters: Filters) => {
    setPagination((p) => ({ ...p, page: 1 }));
    setFilters(newFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Page Header / Breadcrumb */}
        <div className="bg-[#f8f9fc] border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8">
            <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-3">
              <Link href="/" className="hover:text-[#004b9c] transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-medium">Shop</span>
            </div>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1
                  className="text-[32px] font-black text-gray-900 leading-tight tracking-tight"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  All Products
                </h1>
                <p className="text-gray-500 text-[14px] mt-1">
                  Premium cricket gear from the world's best brands
                </p>
              </div>
              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.categories.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1.5 bg-[#004b9c]/10 text-[#004b9c] text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize"
                    >
                      {c}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            categories: filters.categories.filter((x) => x !== c),
                          })
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {filters.brands.map((b) => (
                    <span
                      key={b}
                      className="flex items-center gap-1.5 bg-[#81bf42]/10 text-[#5a8f2a] text-[11px] font-semibold px-3 py-1.5 rounded-full"
                    >
                      {b}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            brands: filters.brands.filter((x) => x !== b),
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
                          setFilters({ ...filters, inStockOnly: false })
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[240px] xl:w-[260px] flex-shrink-0">
              <div className="sticky top-[120px]">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  totalResults={pagination.total}
                />
              </div>
            </aside>

            {/* Products Area */}
            <div className="flex-1 min-w-0">
              {/* Shop header bar */}
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

              {/* Product Grid/List */}
              {loading ? (
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
                    onClick={() => setFilters(DEFAULT_FILTERS)}
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
                        brand: product.brandId?.name ?? "iSPORTS",
                        price: product.price,
                        originalPrice: product.originalPrice,
                        image: product.images?.[0] ?? "/placeholder-product.jpg",
                        isNew: product.isNew,
                        inStock: product.inStock,
                        badge: product.isBestSeller ? "Best Seller" : product.isNew ? "New" : undefined,
                        rating: product.rating,
                        reviewCount: product.reviewCount,
                      }}
                      index={i}
                      onAuthRequired={handleAuthRequired}
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
                  <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    totalResults={pagination.total}
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
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}