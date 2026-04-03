"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import FilterSidebar from "@/components/products/FilterSidebar";
import ShopHeader from "@/components/products/ShopHeader";
import { PRODUCTS, SORT_OPTIONS, type Product } from "@/constants/products";

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
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let results = [...PRODUCTS];

    if (filters.categories.length > 0)
      results = results.filter((p) => filters.categories.includes(p.category));
    if (filters.brands.length > 0)
      results = results.filter((p) => filters.brands.includes(p.brand));
    if (filters.priceRange)
      results = results.filter(
        (p) =>
          p.price >= filters.priceRange!.min &&
          p.price <= filters.priceRange!.max,
      );
    if (filters.inStockOnly) results = results.filter((p) => p.inStock);

    if (sort === "price_asc") results.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") results.sort((a, b) => b.price - a.price);
    else if (sort === "newest")
      results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sort === "best_sellers")
      results.sort(
        (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0),
      );

    return results;
  }, [filters, sort]);

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Page Header / Breadcrumb ── */}
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

      {/* ── Main Layout ── */}
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8">
        <div className="flex gap-8">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-[240px] xl:w-[260px] flex-shrink-0">
            <div className="sticky top-[120px]">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                totalResults={filtered.length}
              />
            </div>
          </aside>

          {/* ── Products Area ── */}
          <div className="flex-1 min-w-0">
            {/* Shop header bar */}
            <div className="flex items-center gap-3 mb-0">
              {/* Mobile filter button */}
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
                  total={filtered.length}
                  sort={sort}
                  onSort={setSort}
                  view={view}
                  onView={setView}
                />
              </div>
            </div>

            {/* Product Grid */}
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={
                    view === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                      : "flex flex-col gap-4"
                  }
                >
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
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
                  onChange={(f) => {
                    setFilters(f);
                  }}
                  totalResults={filtered.length}
                />
              </div>
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#004b9c] text-white text-[13px] font-bold rounded-xl hover:bg-[#003d82] transition-colors"
                >
                  Show {filtered.length} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
