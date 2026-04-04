// src/components/products/FilterSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

interface Filters {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number } | null;
  inStockOnly: boolean;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalResults: number;
}

const PRICE_RANGES = [
  { label: "Under AED 250", min: 0, max: 250 },
  { label: "AED 250 – AED 500", min: 250, max: 500 },
  { label: "AED 500 – AED 1000", min: 500, max: 1000 },
  { label: "AED 1000 – AED 2000", min: 1000, max: 2000 },
  { label: "AED 2000+", min: 2000, max: 10000 },
];

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

export default function FilterSidebar({
  filters,
  onChange,
  totalResults,
}: Props) {
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch("/api/shop/filters");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data.categories);
          setBrands(json.data.brands);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  const toggle = (key: "categories" | "brands", value: string) => {
    const arr = filters[key];
    onChange({
      ...filters,
      [key]: arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    });
  };

  const activeCount =
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  const reset = () =>
    onChange({
      categories: [],
      brands: [],
      priceRange: null,
      inStockOnly: false,
    });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-100 rounded-lg mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full">
      {/* Sidebar Header */}
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

      {/* Category */}
      <Section title="Category">
        <div className="flex flex-col gap-1">
          {categories.map((cat) => {
            const active = filters.categories.includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => toggle("categories", cat.value)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left ${
                  active
                    ? "bg-[#004b9c]/8 text-[#004b9c] font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      active
                        ? "bg-[#004b9c] border-[#004b9c]"
                        : "border-gray-300"
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
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Brands */}
      <Section title="Brand">
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const active = filters.brands.includes(brand.value);
            return (
              <button
                key={brand.value}
                onClick={() => toggle("brands", brand.value)}
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
                {brand.label}
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
