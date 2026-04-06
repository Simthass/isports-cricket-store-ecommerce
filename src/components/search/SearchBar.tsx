"use client";

// src/components/search/SearchBar.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  X,
  Layers,
  Tag,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Client-side security validation (mirrors server rules) ────
const MAX_LENGTH = 100;

function sanitizeInput(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[{}[\]\\]/g, "")
    .slice(0, MAX_LENGTH);
}

function isValidQuery(q: string): boolean {
  if (!q || q.trim().length < 1) return false;
  if (q.length > MAX_LENGTH) return false;
  const blocked = [
    /\$where/i,
    /\$expr/i,
    /\beval\b/i,
    /union\s+select/i,
    /__proto__/i,
  ];
  return !blocked.some((p) => p.test(q));
}

// ── Types ─────────────────────────────────────────────────────
interface ProductSuggestion {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  brand: string;
}
interface CategorySuggestion {
  name: string;
  slug: string;
}
interface BrandSuggestion {
  name: string;
  slug: string;
  logo: string | null;
}

interface Suggestions {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  brands: BrandSuggestion[];
}

const TRENDING = [
  "Cricket Bat",
  "Adidas Shoes",
  "Batting Gloves",
  "Kookaburra Ball",
  "Helmet",
];

// ── SearchBar Component ───────────────────────────────────────
export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [displayValue, setDisplayValue] = useState(""); // what user sees
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(q)}`,
        { signal: AbortSignal.timeout(4000) },
      );
      const json = await res.json();
      if (json.success) setSuggestions(json.suggestions);
    } catch {
      // Silently fail suggestions — don't block UX
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = sanitizeInput(raw);

    // Show what user typed (sanitized), but validate before use
    setDisplayValue(sanitized);
    setError("");

    if (!isValidQuery(sanitized) && sanitized.length > 0) {
      setError("Invalid characters detected");
      setSuggestions(null);
      return;
    }

    setValue(sanitized);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(sanitized.trim());
    }, 280);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = value.trim();
    if (!isValidQuery(q)) {
      setError("Please enter a valid search term");
      return;
    }
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleClear = () => {
    setValue("");
    setDisplayValue("");
    setSuggestions(null);
    setError("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleTrending = (term: string) => {
    const sanitized = sanitizeInput(term);
    setValue(sanitized);
    setDisplayValue(sanitized);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(sanitized)}`);
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.products.length > 0 ||
      suggestions.categories.length > 0 ||
      suggestions.brands.length > 0);

  const showDropdown = open && (value.length >= 2 || value.length === 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center group"
      >
        <Search
          className="absolute left-3.5 text-gray-400 group-focus-within:text-[#004b9c] transition-colors duration-200 pointer-events-none z-10"
          size={15}
        />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Search products, brands, categories..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={MAX_LENGTH}
          className={`w-full bg-gray-50 border hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-[#004b9c]/10 rounded-xl pl-10 pr-10 py-[9px] text-[13px] text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-[#004b9c]"
          }`}
        />
        {/* Loading spinner or clear button */}
        <div className="absolute right-3 flex items-center gap-1">
          {loading && (
            <Loader2 size={13} className="animate-spin text-[#004b9c]" />
          )}
          {displayValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      {/* Error hint */}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-[11px] text-red-500 font-medium px-1">
          {error}
        </p>
      )}

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_16px_60px_rgba(0,75,156,0.18)] border border-gray-100 overflow-hidden z-[999]"
            style={{ minWidth: 340 }}
          >
            {/* No query yet — show trending */}
            {value.length < 2 && (
              <div className="p-4">
                <p className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-3">
                  <TrendingUp size={11} className="text-[#81bf42]" />
                  Trending Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTrending(t)}
                      className="text-[12px] font-medium text-gray-600 bg-gray-50 hover:bg-[#004b9c]/8 hover:text-[#004b9c] px-3 py-1.5 rounded-full border border-gray-100 transition-all duration-150"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Has query, loading */}
            {value.length >= 2 && loading && !hasSuggestions && (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-[13px]">
                <Loader2 size={16} className="animate-spin text-[#004b9c]" />
                Searching...
              </div>
            )}

            {/* Suggestions */}
            {value.length >= 2 && !loading && hasSuggestions && (
              <div className="py-2">
                {/* Categories */}
                {suggestions!.categories.length > 0 && (
                  <div className="px-4 pt-2 pb-1">
                    <p className="text-[9px] font-black text-gray-400 tracking-[0.18em] uppercase mb-1.5">
                      Categories
                    </p>
                    {suggestions!.categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setOpen(false);
                          router.push(`/shop?category=${cat.slug}`);
                        }}
                        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#004b9c]/8 flex items-center justify-center flex-shrink-0">
                          <Layers size={13} className="text-[#004b9c]" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#004b9c]">
                          {cat.name}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-400">
                          Category
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Brands */}
                {suggestions!.brands.length > 0 && (
                  <div className="px-4 pt-2 pb-1">
                    <p className="text-[9px] font-black text-gray-400 tracking-[0.18em] uppercase mb-1.5">
                      Brands
                    </p>
                    {suggestions!.brands.map((brand) => (
                      <button
                        key={brand.slug}
                        onClick={() => {
                          setOpen(false);
                          router.push(`/brand/${brand.slug}`);
                        }}
                        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                          {brand.logo ? (
                            <Image
                              src={brand.logo}
                              alt={brand.name}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          ) : (
                            <Tag size={13} className="text-[#81bf42]" />
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#004b9c]">
                          {brand.name}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-400">
                          Brand
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Products */}
                {suggestions!.products.length > 0 && (
                  <div className="px-4 pt-2 pb-1">
                    <p className="text-[9px] font-black text-gray-400 tracking-[0.18em] uppercase mb-1.5">
                      Products
                    </p>
                    {suggestions!.products.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => {
                          setOpen(false);
                          router.push(`/shop/product/${product.slug}`);
                        }}
                        className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-contain w-full h-full p-1"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-xl" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-gray-800 group-hover:text-[#004b9c] truncate">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-[#81bf42] font-semibold">
                            {product.brand}
                          </span>
                        </div>
                        <span className="text-[13px] font-black text-[#004b9c] flex-shrink-0">
                          AED {product.price.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* View all results */}
                <div className="border-t border-gray-100 px-4 py-2.5 mt-1">
                  <button
                    onClick={() => handleSubmit()}
                    className="flex items-center justify-between w-full text-[12px] font-bold text-[#004b9c] hover:text-[#003d82] group"
                  >
                    <span>
                      View all results for{" "}
                      <span className="italic">"{value}"</span>
                    </span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* No results */}
            {value.length >= 2 && !loading && !hasSuggestions && (
              <div className="px-4 py-5 text-center">
                <p className="text-[13px] text-gray-500 mb-1">
                  No suggestions for{" "}
                  <span className="font-semibold">"{value}"</span>
                </p>
                <button
                  onClick={() => handleSubmit()}
                  className="text-[12px] font-bold text-[#004b9c] hover:underline flex items-center gap-1 mx-auto mt-2"
                >
                  Search anyway <ArrowRight size={12} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
