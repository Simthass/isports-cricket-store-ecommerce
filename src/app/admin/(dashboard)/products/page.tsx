// src/app/admin/products/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Package,
  Star,
  Zap,
  Eye,
  Filter,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Crown,
  QrCode,
  LayoutGrid,
  List,
  Sparkles,
  DollarSign,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQty: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isHeroProduct: boolean;
  heroOrder: number;
  qrScans?: number;
  categoryId?: { _id: string; name: string };
  brandId?: { _id: string; name: string; logo?: string };
  createdAt: string;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

// ── Stats Card Component ──────────────────────────────────────
function StatsCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${color} opacity-10`}
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
          >
            {icon}
          </div>
          {trend && (
            <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-[28px] font-black text-gray-900 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      className={cn(
        "fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-sm text-sm font-semibold max-w-sm",
        toast.type === "success"
          ? "bg-white border-green-100 text-green-800 shadow-green-100/60"
          : "bg-white border-red-100 text-red-700 shadow-red-100/60",
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={17} className="text-green-500 flex-shrink-0" />
      ) : (
        <AlertCircle size={17} className="text-red-500 flex-shrink-0" />
      )}
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Delete Dialog ─────────────────────────────────────────────
function DeleteDialog({
  product,
  onConfirm,
  onCancel,
  loading,
}: {
  product: IProduct;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,22,40,0.55)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Trash2 size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">
              Delete Product
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                &quot;{product.name}&quot;
              </span>
              ? This action cannot be undone and may affect customer orders.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white text-[13px] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Stock Toggle (Modern) ─────────────────────────────────────
function StockToggle({
  product,
  onToggle,
}: {
  product: IProduct;
  onToggle: (id: string, val: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  async function toggle() {
    setLoading(true);
    await onToggle(product._id, !product.inStock);
    setLoading(false);
  }
  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all",
        product.inStock
          ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100",
      )}
    >
      {loading ? (
        <Loader2 size={10} className="animate-spin" />
      ) : product.inStock ? (
        <ToggleRight size={12} />
      ) : (
        <ToggleLeft size={12} />
      )}
      {product.inStock ? "In Stock" : "Out of Stock"}
    </button>
  );
}

// ── Product Badge Component ───────────────────────────────────
function ProductBadge({
  type,
  icon,
  label,
  color,
}: {
  type: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    hero: "from-amber-500 to-orange-500",
    featured: "from-orange-500 to-amber-500",
    trending: "from-purple-500 to-pink-500",
    new: "from-blue-500 to-cyan-500",
    bestseller: "from-green-500 to-emerald-500",
  };
  const gradient = colorMap[type] || "from-gray-500 to-slate-500";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white text-[9px] font-bold shadow-sm`}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"" | "true" | "false">("");
  const [deleteTarget, setDeleteTarget] = useState<IProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const showToast = useCallback(
    (type: ToastState["type"], message: string) => setToast({ type, message }),
    [],
  );

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (search) params.set("search", search);
        if (filterStock) params.set("inStock", filterStock);
        const res = await fetch(`/api/products?${params}`);
        const json = await res.json();
        if (json.success) {
          setProducts(json.data);
          setPagination(json.pagination);
        }
      } catch {
        showToast("error", "Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [search, filterStock, showToast],
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  async function handleStockToggle(id: string, val: boolean) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: val }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, inStock: val } : p)),
        );
        showToast(
          "success",
          val ? "Marked as In Stock" : "Marked as Out of Stock",
        );
      }
    } catch {
      showToast("error", "Failed to update stock");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        showToast("success", `"${deleteTarget.name}" deleted`);
      } else {
        showToast("error", json.error ?? "Delete failed");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  const inStockCount = products.filter((p) => p.inStock).length;
  const featuredCount = products.filter((p) => p.isFeatured).length;
  const newArrivalsCount = products.filter((p) => p.isNewArrival).length;
  const trendingCount = products.filter((p) => p.isTrending).length;
  const heroCount = products.filter((p) => p.isHeroProduct).length;

  const stats = {
    total: pagination.total,
    inStock: inStockCount,
    featured: featuredCount,
    newArrivals: newArrivalsCount,
    trending: trendingCount,
    hero: heroCount,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="space-y-6 max-w-[1600px] mx-auto p-6">
        {/* Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#004b9c] to-[#0062cc] rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
                <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">
                  Inventory
                </span>
              </div>
              <h1 className="text-[28px] font-black tracking-tight">
                Product Management
              </h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Manage your cricket equipment inventory and product details
              </p>
            </div>
            <Link href="/admin/products/new">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#25D366] to-[#20b859] hover:shadow-lg transition-all">
                <Plus size={16} /> Add New Product
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatsCard
            title="Total Products"
            value={stats.total}
            icon={<ShoppingBag size={18} className="text-white" />}
            color="from-blue-500 to-cyan-500"
            trend={stats.total > 0 ? "+12% this month" : undefined}
          />
          <StatsCard
            title="In Stock"
            value={stats.inStock}
            icon={<Package size={18} className="text-white" />}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Featured"
            value={stats.featured}
            icon={<Star size={18} className="text-white" />}
            color="from-amber-500 to-orange-500"
          />
          <StatsCard
            title="New Arrivals"
            value={stats.newArrivals}
            icon={<Zap size={18} className="text-white" />}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            title="Trending"
            value={stats.trending}
            icon={<TrendingUp size={18} className="text-white" />}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="Hero"
            value={stats.hero}
            icon={<Crown size={18} className="text-white" />}
            color="from-amber-500 to-yellow-500"
          />
        </div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name, brand, or category..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Stock Filter */}
            <div className="relative">
              <Filter
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={filterStock}
                onChange={(e) =>
                  setFilterStock(e.target.value as "" | "true" | "false")
                }
                className="pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004b9c] text-[13px] outline-none appearance-none cursor-pointer"
              >
                <option value="">All Stock</option>
                <option value="true">In Stock Only</option>
                <option value="false">Out of Stock Only</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#004b9c]" : "text-gray-500"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#004b9c]" : "text-gray-500"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-48" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <p className="text-[16px] font-bold text-gray-700 mb-1">
                {search ? "No products match your search" : "No products yet"}
              </p>
              <p className="text-[13px] text-gray-400 mb-5 max-w-sm">
                {search
                  ? "Try a different keyword or clear the search filter"
                  : "Add your first product to start selling"}
              </p>
              {!search ? (
                <Link href="/admin/products/new">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold bg-gradient-to-r from-[#004b9c] to-[#0062cc] shadow-md">
                    <Plus size={14} /> Add First Product
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => setSearch("")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-bold"
                >
                  <Filter size={14} /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Product
                      </th>
                      <th className="text-left px-4 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden sm:table-cell">
                        Category / Brand
                      </th>
                      <th className="text-left px-4 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Price
                      </th>
                      <th className="text-left px-4 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden md:table-cell">
                        Stock
                      </th>
                      <th className="text-left px-4 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Tags
                      </th>
                      <th className="text-left px-4 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden lg:table-cell">
                        QR Scans
                      </th>
                      <th className="text-right px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {products.map((product, i) => (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                        >
                          {/* Product Info */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                {product.images[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag
                                      size={18}
                                      className="text-gray-300"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[14px] font-bold text-gray-900 truncate max-w-[200px]">
                                  {product.name}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">
                                  /{product.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category / Brand */}
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <div className="space-y-0.5">
                              {product.categoryId && (
                                <p className="text-[12px] font-semibold text-gray-700">
                                  {product.categoryId.name}
                                </p>
                              )}
                              {product.brandId && (
                                <p className="text-[11px] text-gray-400">
                                  {product.brandId.name}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="text-[14px] font-bold text-[#004b9c]">
                                AED {product.price.toLocaleString()}
                              </p>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <p className="text-[10px] text-gray-400 line-through">
                                    AED {product.originalPrice.toLocaleString()}
                                  </p>
                                )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <StockToggle
                              product={product}
                              onToggle={handleStockToggle}
                            />
                          </td>

                          {/* Tags */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              {product.isHeroProduct && (
                                <ProductBadge
                                  type="hero"
                                  icon={<Crown size={9} />}
                                  label="HERO"
                                  color="hero"
                                />
                              )}
                              {product.isFeatured && (
                                <ProductBadge
                                  type="featured"
                                  icon={<Star size={9} />}
                                  label="FEATURED"
                                  color="featured"
                                />
                              )}
                              {product.isTrending && (
                                <ProductBadge
                                  type="trending"
                                  icon={<TrendingUp size={9} />}
                                  label="TRENDING"
                                  color="trending"
                                />
                              )}
                              {product.isNewArrival && (
                                <ProductBadge
                                  type="new"
                                  icon={<Zap size={9} />}
                                  label="NEW"
                                  color="new"
                                />
                              )}
                              {product.isBestSeller && (
                                <ProductBadge
                                  type="bestseller"
                                  icon={<Star size={9} />}
                                  label="BESTSELLER"
                                  color="bestseller"
                                />
                              )}
                              {product.heroOrder > 0 &&
                                product.isHeroProduct && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200">
                                    Order: {product.heroOrder}
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* QR Scans */}
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <div className="flex items-center gap-1.5">
                              <QrCode size={11} className="text-gray-300" />
                              <span className="text-[13px] font-semibold text-gray-600">
                                {(product.qrScans ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/products/${product.slug}/qr-analytics`}
                              >
                                <button
                                  title="QR Code & Analytics"
                                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#004b9c] hover:border-[#004b9c]/30 hover:bg-blue-50 transition-all"
                                >
                                  <QrCode size={13} />
                                </button>
                              </Link>
                              <Link href={`/admin/products/${product.slug}`}>
                                <button className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#004b9c] hover:border-[#004b9c]/30 hover:bg-blue-50 transition-all">
                                  <Pencil size={13} />
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-[12px] text-gray-500">
                    Showing {(pagination.page - 1) * 20 + 1} to{" "}
                    {Math.min(pagination.page * 20, pagination.total)} of{" "}
                    {pagination.total} products
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchProducts(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
                    >
                      ← Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;
                        let startPage = Math.max(
                          1,
                          pagination.page - Math.floor(maxVisible / 2),
                        );
                        let endPage = Math.min(
                          pagination.pages,
                          startPage + maxVisible - 1,
                        );
                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        return pages.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => fetchProducts(pageNum)}
                            className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all ${
                              pagination.page === pageNum
                                ? "bg-[#004b9c] text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ));
                      })()}
                    </div>
                    <button
                      onClick={() => fetchProducts(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            product={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
