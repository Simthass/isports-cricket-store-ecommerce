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
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  categoryId?: { _id: string; name: string };
  brandId?: { _id: string; name: string; logo?: string };
  createdAt: string;
}

interface ToastState {
  type: "success" | "error";
  message: string;
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
        "fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold max-w-sm",
        toast.type === "success"
          ? "bg-white border-green-100 text-green-800"
          : "bg-white border-red-100 text-red-700",
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
        className="ml-auto text-gray-400 hover:text-gray-600"
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
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">
              Delete Product
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Delete{" "}
              <span className="font-semibold text-gray-700">
                &quot;{product.name}&quot;
              </span>
              ? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Stock Toggle ──────────────────────────────────────────────
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
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all",
        product.inStock
          ? "bg-green-50 border-green-100 text-green-700 hover:bg-green-100"
          : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100",
      )}
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin" />
      ) : product.inStock ? (
        <ToggleRight size={13} />
      ) : (
        <ToggleLeft size={13} />
      )}
      {product.inStock ? "In Stock" : "Out of Stock"}
    </button>
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

  return (
    <div className="space-y-5 max-w-[1380px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <p className="text-[11px] font-semibold text-[#81bf42] tracking-[0.15em] uppercase mb-1">
            Inventory
          </p>
          <h2
            className="text-[22px] font-black text-gray-900 tracking-tight leading-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Product Management
          </h2>
        </div>
        <Link href="/admin/products/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-[12px] font-bold rounded-xl shadow-[0_4px_12px_rgba(0,75,156,0.25)]"
            style={{ background: "linear-gradient(135deg, #004b9c, #0062cc)" }}
          >
            <Plus size={14} /> Add Product
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          {
            label: "Total Products",
            value: pagination.total,
            icon: ShoppingBag,
            color: "#004b9c",
            bg: "#e8f0fb",
          },
          {
            label: "In Stock",
            value: inStockCount,
            icon: Package,
            color: "#16a34a",
            bg: "#f0fdf4",
          },
          {
            label: "Featured",
            value: products.filter((p) => p.isFeatured).length,
            icon: Star,
            color: "#f59e0b",
            bg: "#fef3c7",
          },
          {
            label: "New Arrivals",
            value: products.filter((p) => p.isNew).length,
            icon: Zap,
            color: "#8b5cf6",
            bg: "#ede9fe",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-black text-gray-900 leading-none">
                {s.value}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {s.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex items-center gap-3 flex-wrap bg-white rounded-2xl border border-gray-100 p-4"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 text-[13px] outline-none transition-all"
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
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <p className="text-[12px] text-gray-400 ml-auto">
          {pagination.total} products
        </p>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Category / Brand
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Stock
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Tags
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3 bg-gray-100 rounded w-32" />
                          <div className="h-2.5 bg-gray-100 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="h-6 bg-gray-100 rounded-lg w-20" />
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="h-5 bg-gray-100 rounded-lg w-16" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-8 bg-gray-100 rounded-xl w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-300" />
                      </div>
                      <p className="text-[14px] font-bold text-gray-500">
                        No products found
                      </p>
                      <p className="text-[12px] text-gray-400">
                        {search
                          ? "Try a different search"
                          : "Add your first product"}
                      </p>
                      {!search && (
                        <Link href="/admin/products/new">
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[12px] font-bold mt-1"
                            style={{
                              background:
                                "linear-gradient(135deg, #004b9c, #0062cc)",
                            }}
                          >
                            <Plus size={13} /> Add Product
                          </button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {products.map((product, i) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
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
                            <p className="text-[13px] font-bold text-gray-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-[10.5px] text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">
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
                          <p className="text-[13px] font-bold text-gray-900">
                            AED {product.price.toLocaleString()}
                          </p>
                          {product.originalPrice && (
                            <p className="text-[11px] text-gray-400 line-through">
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
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1 flex-wrap">
                          {product.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[9.5px] font-bold text-amber-600">
                              FEATURED
                            </span>
                          )}
                          {product.isNew && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[9.5px] font-bold text-blue-600">
                              NEW
                            </span>
                          )}
                          {product.isBestSeller && (
                            <span className="px-1.5 py-0.5 rounded-md bg-green-50 border border-green-100 text-[9.5px] font-bold text-green-600">
                              BESTSELLER
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product._id}`}>
                            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#004b9c] hover:border-[#004b9c]/30 hover:bg-[#e8f0fb] transition-all">
                              <Pencil size={13} />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
            <p className="text-[12px] text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

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
