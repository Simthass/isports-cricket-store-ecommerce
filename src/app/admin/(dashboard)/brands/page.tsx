"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Hash,
  Globe,
  Award,
  ShieldCheck,
  Flag,
  TrendingUp,
  FolderOpen,
  Sparkles,
  Copy,
  Check,
  LayoutGrid,
  List,
  Filter,
  Zap,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface IBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  createdAt: string;
}

type ModalMode = "add" | "edit" | null;

interface FormState {
  name: string;
  logo: string;
  country: string;
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
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
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
  brand,
  onConfirm,
  onCancel,
  loading,
}: {
  brand: IBrand;
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
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">
              Delete Brand
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                &quot;{brand.name}&quot;
              </span>
              ? This action cannot be undone and may affect linked products.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
            {loading ? "Deleting…" : "Delete Brand"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Brand Modal ───────────────────────────────────────────────
function BrandModal({
  mode,
  initial,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  initial?: IBrand;
  onClose: () => void;
  onSuccess: (brand: IBrand, mode: "add" | "edit") => void;
}) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    logo: initial?.logo ?? "",
    country: initial?.country ?? "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 80);
  }, []);

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (form.logo && !/^https?:\/\/.+/.test(form.logo.trim()))
      e.logo = "Must be a valid URL (https://…)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const url =
        mode === "add" ? "/api/brands" : `/api/brands/${initial?._id}`;
      const method = mode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          logo: form.logo.trim(),
          country: form.country.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          typeof json.error === "string" ? json.error : "Something went wrong";
        setErrors({ name: msg });
        return;
      }
      onSuccess(json.data as IBrand, mode);
    } catch {
      setErrors({ name: "Network error, please try again" });
    } finally {
      setLoading(false);
    }
  }

  const slugPreview = form.name.trim()
    ? form.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : "";

  const logoValid = form.logo && /^https?:\/\/.+/.test(form.logo);

  const handleCopySlug = () => {
    if (slugPreview) {
      navigator.clipboard.writeText(slugPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,22,40,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#004b9c] to-[#0062cc] px-6 py-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Award size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white">
                  {mode === "add" ? "Add New Brand" : "Edit Brand"}
                </h2>
                <p className="text-[11px] text-blue-100">
                  {mode === "add"
                    ? "Register a new cricket brand"
                    : "Update brand details"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Logo preview strip */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-xl border-2 border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              {logoValid ? (
                <img
                  src={form.logo}
                  alt="logo preview"
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <ImageIcon size={20} className="text-gray-300" />
                  <span className="text-[8px] text-gray-300 font-medium">
                    LOGO
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-gray-800 truncate">
                {form.name.trim() || "Brand Name"}
              </p>
              {form.country && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Flag size={10} /> {form.country}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <code className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  /{slugPreview || "brand-slug"}
                </code>
                {slugPreview && (
                  <button
                    type="button"
                    onClick={handleCopySlug}
                    className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                  >
                    {copied ? (
                      <Check size={10} className="text-green-500" />
                    ) : (
                      <Copy size={10} className="text-gray-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (errors.name)
                  setErrors((er) => ({ ...er, name: undefined }));
              }}
              placeholder="e.g. Gray-Nicolls, SS, Kookaburra"
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                errors.name
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100",
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.name}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Country of Origin
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <Globe
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
                placeholder="e.g. England, Australia, India, Pakistan"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Logo URL
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="url"
              value={form.logo}
              onChange={(e) => {
                setForm((f) => ({ ...f, logo: e.target.value }));
                if (errors.logo)
                  setErrors((er) => ({ ...er, logo: undefined }));
              }}
              placeholder="https://example.com/logo.png"
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                errors.logo
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100",
              )}
            />
            {errors.logo && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.logo}
              </p>
            )}
            {logoValid && !errors.logo && (
              <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={10} /> Logo URL looks valid
              </p>
            )}
          </div>

          {/* Info note */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[10px] text-blue-700 flex items-center gap-1.5">
              <Sparkles size={11} />
              Slug will be auto-generated from brand name. Products will use
              this for filtering.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl text-white text-[13px] font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : mode === "add" ? (
                <Plus size={14} />
              ) : (
                <Pencil size={14} />
              )}
              {loading
                ? mode === "add"
                  ? "Creating..."
                  : "Saving..."
                : mode === "add"
                  ? "Create Brand"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
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

// ── Brand Card (Modern UI) ────────────────────────────────────
// ── Brand Card (Modern UI with Top Actions) ────────────────────
function BrandCard({
  brand,
  index,
  onEdit,
  onDelete,
}: {
  brand: IBrand;
  index: number;
  onEdit: (b: IBrand) => void;
  onDelete: (b: IBrand) => void;
}) {
  const initials = brand.name.slice(0, 2).toUpperCase();

  const accentColors = [
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-purple-500 to-pink-500",
    "from-red-500 to-rose-500",
    "from-teal-500 to-emerald-500",
    "from-indigo-500 to-blue-500",
  ];
  const colorIndex =
    brand.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    accentColors.length;
  const gradient = accentColors[colorIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{
        delay: index * 0.03,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Gradient top bar */}
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      {/* Action Buttons - Top Right Corner */}
      <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(brand)}
          className="w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-[#004b9c] hover:bg-[#004b9c] hover:text-white transition-all duration-200"
          title="Edit brand"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(brand)}
          className="w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
          title="Delete brand"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Logo area */}
      <div className="relative h-32 overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="relative z-10 max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-black text-white shadow-lg bg-gradient-to-r ${gradient}`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3.5">
        <h3 className="text-[14px] font-bold text-gray-900 truncate pr-8">
          {brand.name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          <Hash size={10} className="text-gray-300" />
          <p className="text-[10px] text-gray-400 font-mono truncate">
            {brand.slug}
          </p>
        </div>

        {/* Country badge */}
        {brand.country && (
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-500">
              <Flag size={9} />
              {brand.country}
            </span>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-2.5">
          Added{" "}
          {new Date(brand.createdAt).toLocaleDateString("en-AE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [filtered, setFiltered] = useState<IBrand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<IBrand | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<IBrand | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message });
  }, []);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brands");
      const json = await res.json();
      if (json.success) {
        setBrands(json.data as IBrand[]);
        setFiltered(json.data as IBrand[]);
      }
    } catch {
      showToast("error", "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // ── Search filter ──────────────────────────────────────────
  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q
        ? brands.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              b.slug.toLowerCase().includes(q) ||
              (b.country ?? "").toLowerCase().includes(q),
          )
        : brands,
    );
  }, [search, brands]);

  // ── Handlers ───────────────────────────────────────────────
  function handleModalSuccess(brand: IBrand, mode: "add" | "edit") {
    if (mode === "add") {
      setBrands((prev) => [brand, ...prev]);
      showToast("success", `"${brand.name}" brand created!`);
    } else {
      setBrands((prev) => prev.map((b) => (b._id === brand._id ? brand : b)));
      showToast("success", `"${brand.name}" updated successfully`);
    }
    setModalMode(null);
    setEditTarget(undefined);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/brands/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBrands((prev) => prev.filter((b) => b._id !== deleteTarget._id));
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

  const countries = Array.from(
    new Set(brands.map((b) => b.country).filter(Boolean)),
  ) as string[];

  const stats = {
    total: brands.length,
    withLogo: brands.filter((b) => b.logo).length,
    countries: countries.length,
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
                  Product Catalogue
                </span>
              </div>
              <h1 className="text-[28px] font-black tracking-tight">
                Brand Management
              </h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Manage cricket equipment brands and their details
              </p>
            </div>
            <button
              onClick={() => {
                setEditTarget(undefined);
                setModalMode("add");
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#25D366] to-[#20b859] hover:shadow-lg transition-all"
            >
              <Plus size={16} /> Add New Brand
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Brands"
            value={stats.total}
            icon={<Award size={18} className="text-white" />}
            color="from-blue-500 to-cyan-500"
            trend={stats.total > 0 ? "+12% this month" : undefined}
          />
          <StatsCard
            title="With Logo"
            value={stats.withLogo}
            icon={<ImageIcon size={18} className="text-white" />}
            color="from-emerald-500 to-teal-500"
          />
          <StatsCard
            title="Countries"
            value={stats.countries}
            icon={<Globe size={18} className="text-white" />}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="Active Brands"
            value={stats.total}
            icon={<Star size={18} className="text-white" />}
            color="from-orange-500 to-amber-500"
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
                placeholder="Search brands by name, slug, or country..."
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

          {/* Country Filter Chips */}
          {countries.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              <button
                onClick={() => setSearch("")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  !search
                    ? "bg-[#004b9c] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({brands.length})
              </button>
              {countries.slice(0, 8).map((c) => (
                <button
                  key={c}
                  onClick={() => setSearch(c)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                    search === c
                      ? "bg-gradient-to-r from-[#004b9c] to-[#0062cc] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Flag size={10} />
                  {c}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Brands Display */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded-md w-1/2" />
                  <div className="h-2 bg-gray-100 rounded-md w-1/3 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
              <Award size={32} className="text-gray-400" />
            </div>
            <p className="text-[16px] font-bold text-gray-700 mb-1">
              {search ? "No brands match your search" : "No brands yet"}
            </p>
            <p className="text-[13px] text-gray-400 mb-5 max-w-sm">
              {search
                ? "Try a different keyword or clear the search filter"
                : "Add your first cricket brand to get started"}
            </p>
            {!search ? (
              <button
                onClick={() => {
                  setEditTarget(undefined);
                  setModalMode("add");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold bg-gradient-to-r from-[#004b9c] to-[#0062cc] shadow-md"
              >
                <Plus size={14} /> Add First Brand
              </button>
            ) : (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-bold"
              >
                <Filter size={14} /> Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((brand, i) => (
                <BrandCard
                  key={brand._id}
                  brand={brand}
                  index={i}
                  onEdit={(b) => {
                    setEditTarget(b);
                    setModalMode("edit");
                  }}
                  onDelete={setDeleteTarget}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <div className="flex justify-between items-center text-[12px] text-gray-400 pt-2">
            <p>
              Showing {filtered.length} of {brands.length} brands
            </p>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {modalMode && (
            <BrandModal
              mode={modalMode}
              initial={editTarget}
              onClose={() => {
                setModalMode(null);
                setEditTarget(undefined);
              }}
              onSuccess={handleModalSuccess}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteTarget && (
            <DeleteDialog
              brand={deleteTarget}
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
    </div>
  );
}
