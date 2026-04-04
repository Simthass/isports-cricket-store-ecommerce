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
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e8f0fb] flex items-center justify-center">
              <Award size={16} style={{ color: "#004b9c" }} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">
                {mode === "add" ? "Add Brand" : "Edit Brand"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === "add"
                  ? "Register a new cricket brand"
                  : "Update brand details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Logo preview strip */}
          <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              {logoValid ? (
                <img
                  src={form.logo}
                  alt="logo preview"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <ImageIcon size={18} className="text-gray-300" />
                  <span className="text-[8px] text-gray-300 font-medium">
                    LOGO
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-800 truncate">
                {form.name.trim() || "Brand Name"}
              </p>
              {form.country && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Flag size={9} /> {form.country}
                </p>
              )}
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                {slugPreview ? `/${slugPreview}` : "/brand-slug"}
              </p>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
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
              placeholder="e.g. Gray-Nicolls"
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                errors.name
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10",
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.name}
              </p>
            )}
            {slugPreview && !errors.name && (
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Hash size={10} />
                Slug:{" "}
                <span className="font-mono text-[#004b9c]">{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Country of Origin{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
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
                placeholder="e.g. England, Australia, India"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Logo URL{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={form.logo}
              onChange={(e) => {
                setForm((f) => ({ ...f, logo: e.target.value }));
                if (errors.logo)
                  setErrors((er) => ({ ...er, logo: undefined }));
              }}
              placeholder="https://…"
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                errors.logo
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10",
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

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,75,156,0.22)]"
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
                  ? "Creating…"
                  : "Saving…"
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

// ── Brand Card ────────────────────────────────────────────────
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

  // Deterministic accent color per brand
  const accentColors = [
    "#004b9c",
    "#81bf42",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ef4444",
    "#10b981",
    "#f97316",
  ];
  const colorIndex =
    brand.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    accentColors.length;
  const accent = accentColors[colorIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 overflow-hidden"
    >
      {/* Logo area */}
      <div
        className="relative h-32 overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${accent}08, ${accent}14)`,
        }}
      >
        {/* Subtle geometric bg */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: accent, transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: accent, transform: "translate(-30%, 30%)" }}
        />

        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="relative z-10 max-h-16 max-w-[70%] object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-black text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            }}
          >
            {initials}
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(brand)}
            className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-[#004b9c] hover:bg-[#004b9c] hover:text-white transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(brand)}
            className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-gray-900 truncate">
              {brand.name}
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
              /{brand.slug}
            </p>
          </div>
          <ChevronRight
            size={14}
            className="text-gray-300 mt-0.5 flex-shrink-0"
          />
        </div>

        {/* Country badge */}
        {brand.country && (
          <div className="flex items-center gap-1 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10.5px] font-medium text-gray-500">
              <Flag size={9} />
              {brand.country}
            </span>
          </div>
        )}

        <p className="text-[10.5px] text-gray-400 mt-2">
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

  // ── Unique countries for quick filter pill ─────────────────
  const countries = Array.from(
    new Set(brands.map((b) => b.country).filter(Boolean)),
  ) as string[];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-[1380px]">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <p className="text-[11px] font-semibold text-[#81bf42] tracking-[0.15em] uppercase mb-1">
            Product Catalogue
          </p>
          <h2
            className="text-[22px] font-black text-gray-900 tracking-tight leading-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Brand Management
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setEditTarget(undefined);
            setModalMode("add");
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-[12px] font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,75,156,0.25)]"
          style={{ background: "linear-gradient(135deg, #004b9c, #0062cc)" }}
        >
          <Plus size={14} />
          Add Brand
        </motion.button>
      </motion.div>

      {/* ── Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 flex-wrap"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e8f0fb] flex items-center justify-center">
            <Award size={16} style={{ color: "#004b9c" }} />
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {brands.length}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              Total Brands
            </p>
          </div>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#eef7e0] flex items-center justify-center">
            <ShieldCheck size={16} style={{ color: "#81bf42" }} />
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {brands.filter((b) => b.logo).length}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">With Logo</p>
          </div>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Globe size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {countries.length}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">Countries</p>
          </div>
        </div>

        {/* Country quick-filter pills */}
        {countries.length > 0 && (
          <>
            <div className="w-px h-10 bg-gray-100 hidden sm:block" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {countries.slice(0, 4).map((c) => (
                <button
                  key={c}
                  onClick={() => setSearch(c)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all",
                    search === c
                      ? "bg-[#004b9c] text-white border-[#004b9c]"
                      : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Search — pushed right */}
        <div className="ml-auto relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands…"
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 text-[13px] text-gray-700 placeholder-gray-400 outline-none transition-all w-52"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Grid ── */}
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
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Award size={28} className="text-gray-300" />
          </div>
          <p className="text-[15px] font-bold text-gray-600 mb-1">
            {search ? "No brands match your search" : "No brands yet"}
          </p>
          <p className="text-[13px] text-gray-400 mb-5">
            {search
              ? "Try a different keyword or clear the search"
              : "Add your first cricket brand to get started"}
          </p>
          {!search && (
            <button
              onClick={() => {
                setEditTarget(undefined);
                setModalMode("add");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[12.5px] font-bold shadow-[0_4px_12px_rgba(0,75,156,0.22)] transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              <Plus size={14} /> Add First Brand
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
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
        </motion.div>
      )}

      {/* ── Modals ── */}
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

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
