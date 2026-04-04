"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  X,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ChevronRight,
  Hash,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: string;
}

type ModalMode = "add" | "edit" | null;

interface FormState {
  name: string;
  image: string;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

// ── Toast Component ───────────────────────────────────────────
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

// ── Delete Confirm Dialog ─────────────────────────────────────
function DeleteDialog({
  category,
  onConfirm,
  onCancel,
  loading,
}: {
  category: ICategory;
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
              Delete Category
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                &quot;{category.name}&quot;
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

// ── Category Modal (Add / Edit) ───────────────────────────────
function CategoryModal({
  mode,
  initial,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  initial?: ICategory;
  onClose: () => void;
  onSuccess: (cat: ICategory, mode: "add" | "edit") => void;
}) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    image: initial?.image ?? "",
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
    if (form.image && !/^https?:\/\/.+/.test(form.image.trim()))
      e.image = "Must be a valid URL (https://…)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const url =
        mode === "add" ? "/api/categories" : `/api/categories/${initial?._id}`;
      const method = mode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          image: form.image.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          typeof json.error === "string" ? json.error : "Something went wrong";
        setErrors({ name: msg });
        return;
      }
      onSuccess(json.data as ICategory, mode);
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
              <Tag size={16} style={{ color: "#004b9c" }} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">
                {mode === "add" ? "Add Category" : "Edit Category"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === "add"
                  ? "Create a new product category"
                  : "Update category details"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
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
              placeholder="e.g. Cricket Bats"
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
            {/* Slug preview */}
            {slugPreview && !errors.name && (
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Hash size={10} />
                Slug:{" "}
                <span className="font-mono text-[#004b9c]">{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Image URL{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.image}
                onChange={(e) => {
                  setForm((f) => ({ ...f, image: e.target.value }));
                  if (errors.image)
                    setErrors((er) => ({ ...er, image: undefined }));
                }}
                placeholder="https://…"
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                  errors.image
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10",
                )}
              />
              {/* Image preview */}
              {form.image && /^https?:\/\/.+/.test(form.image) ? (
                <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                  <Image
                    src={form.image}
                    alt="preview"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50">
                  <ImageIcon size={16} className="text-gray-300" />
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.image}
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
                  ? "Create Category"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Category Card ─────────────────────────────────────────────
function CategoryCard({
  category,
  index,
  onEdit,
  onDelete,
}: {
  category: ICategory;
  index: number;
  onEdit: (cat: ICategory) => void;
  onDelete: (cat: ICategory) => void;
}) {
  const initials = category.name.slice(0, 2).toUpperCase();

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
      {/* Image area */}
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[20px] font-black text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              {initials}
            </div>
          </div>
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(category)}
            className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-[#004b9c] hover:bg-[#004b9c] hover:text-white transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(category)}
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
              {category.name}
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
              /{category.slug}
            </p>
          </div>
          <ChevronRight
            size={14}
            className="text-gray-300 mt-0.5 flex-shrink-0"
          />
        </div>
        <p className="text-[10.5px] text-gray-400 mt-2">
          Added{" "}
          {new Date(category.createdAt).toLocaleDateString("en-AE", {
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
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filtered, setFiltered] = useState<ICategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<ICategory | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message });
  }, []);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data as ICategory[]);
        setFiltered(json.data as ICategory[]);
      }
    } catch {
      showToast("error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Search filter ──────────────────────────────────────────
  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q
        ? categories.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.slug.toLowerCase().includes(q),
          )
        : categories,
    );
  }, [search, categories]);

  // ── Handlers ───────────────────────────────────────────────
  function handleModalSuccess(cat: ICategory, mode: "add" | "edit") {
    if (mode === "add") {
      setCategories((prev) => [cat, ...prev]);
      showToast("success", `"${cat.name}" category created!`);
    } else {
      setCategories((prev) => prev.map((c) => (c._id === cat._id ? cat : c)));
      showToast("success", `"${cat.name}" updated successfully`);
    }
    setModalMode(null);
    setEditTarget(undefined);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
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
            Category Management
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
          Add Category
        </motion.button>
      </motion.div>

      {/* ── Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e8f0fb] flex items-center justify-center">
            <Tag size={16} style={{ color: "#004b9c" }} />
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {categories.length}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              Total Categories
            </p>
          </div>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#eef7e0] flex items-center justify-center">
            <ImageIcon size={16} style={{ color: "#81bf42" }} />
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {categories.filter((c) => c.image).length}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">With Images</p>
          </div>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <FolderOpen size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {categories.filter((c) => !c.image).length}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">No Image</p>
          </div>
        </div>
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
            placeholder="Search categories…"
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 text-[13px] text-gray-700 placeholder-gray-400 outline-none transition-all w-56"
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
              <div className="h-36 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded-md w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded-md w-1/2" />
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
            <FolderOpen size={28} className="text-gray-300" />
          </div>
          <p className="text-[15px] font-bold text-gray-600 mb-1">
            {search ? "No categories match your search" : "No categories yet"}
          </p>
          <p className="text-[13px] text-gray-400 mb-5">
            {search
              ? `Try a different keyword or clear the search`
              : "Create your first category to organise products"}
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
              <Plus size={14} /> Add First Category
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((cat, i) => (
              <CategoryCard
                key={cat._id}
                category={cat}
                index={i}
                onEdit={(c) => {
                  setEditTarget(c);
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
          <CategoryModal
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
            category={deleteTarget}
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
