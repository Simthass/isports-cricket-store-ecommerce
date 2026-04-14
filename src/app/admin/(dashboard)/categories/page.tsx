// src/app/admin/categories/page.tsx
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
  Hash,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ISubCategory {
  name: string;
  slug: string;
}

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subCategories: ISubCategory[];
  createdAt: string;
}

type ModalMode = "add" | "edit" | null;

interface FormState {
  name: string;
  image: string;
  subCategories: string[]; // names only, slugs generated on save
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

// ── Stats Card ────────────────────────────────────────────────
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
        transition={{ duration: 0.22 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Trash2 size={20} className="text-white" />
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
            {loading ? "Deleting…" : "Delete Category"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Sub-Category Tag Input ────────────────────────────────────
function SubCategoryInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (
      !trimmed ||
      value.some((v) => v.toLowerCase() === trimmed.toLowerCase())
    ) {
      setInput("");
      return;
    }
    onChange([...value, trimmed]);
    setInput("");
  }

  function removeTag(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#e8f0fb] text-[#004b9c] text-[12px] font-semibold rounded-lg"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="text-[#004b9c]/60 hover:text-[#004b9c] transition-colors ml-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. English Willow, Kashmir Willow…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="px-3 py-2.5 rounded-xl bg-[#004b9c] text-white disabled:opacity-40 hover:bg-[#003a7a] transition-colors flex items-center gap-1 text-[12px] font-bold"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <p className="text-[10px] text-gray-400 flex items-center gap-1">
        <Sparkles size={9} />
        Press Enter or comma to add · Backspace to remove last
      </p>
    </div>
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
    subCategories: initial?.subCategories?.map((s) => s.name) ?? [],
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 80);
  }, []);

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
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
          subCategories: form.subCategories.map((name) => ({ name })),
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

  const imageValid = form.image && /^https?:\/\/.+/.test(form.image);

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
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#004b9c] to-[#0062cc] px-6 py-5 flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Tag size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white">
                  {mode === "add" ? "Add New Category" : "Edit Category"}
                </h2>
                <p className="text-[11px] text-blue-100">
                  {mode === "add"
                    ? "Create a new product category"
                    : "Update category details"}
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

        {/* Form – scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1"
        >
          {/* Name */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
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
              placeholder="e.g. Cricket Bats, Helmets, Shoes"
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
            {slugPreview && !errors.name && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-700 flex items-center gap-1.5">
                  <Hash size={10} />
                  Slug:{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded text-blue-600">
                    /{slugPreview}
                  </code>
                </p>
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Image URL{" "}
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={form.image}
                onChange={(e) => {
                  setForm((f) => ({ ...f, image: e.target.value }));
                  if (errors.image)
                    setErrors((er) => ({ ...er, image: undefined }));
                }}
                placeholder="https://example.com/category-image.jpg"
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                  errors.image
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100",
                )}
              />
              <div className="w-14 h-14 rounded-xl border-2 border-gray-100 overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                {imageValid ? (
                  <Image
                    src={form.image}
                    alt="preview"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={18} className="text-gray-300" />
                  </div>
                )}
              </div>
            </div>
            {errors.image && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.image}
              </p>
            )}
            {imageValid && !errors.image && (
              <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={10} /> Image URL looks valid
              </p>
            )}
          </div>

          {/* Sub-categories */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Sub-categories{" "}
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
              {form.subCategories.length > 0 && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#e8f0fb] text-[#004b9c] text-[10px] font-bold">
                  {form.subCategories.length}
                </span>
              )}
            </label>
            <SubCategoryInput
              value={form.subCategories}
              onChange={(v) => setForm((f) => ({ ...f, subCategories: v }))}
            />
          </div>

          {/* Info note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] text-amber-700 flex items-center gap-1.5">
              <Sparkles size={11} />
              Sub-categories help customers narrow down products within a
              category.
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
  const [subOpen, setSubOpen] = useState(false);
  const initials = category.name.slice(0, 2).toUpperCase();

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
    category.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    accentColors.length;
  const gradient = accentColors[colorIndex];
  const hasSubs = category.subCategories?.length > 0;

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

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(category)}
          className="w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-[#004b9c] hover:bg-[#004b9c] hover:text-white transition-all duration-200"
          title="Edit category"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
          title="Delete category"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Image area */}
      <div className="relative h-32 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-black text-white shadow-lg bg-gradient-to-r ${gradient}`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3.5">
        <h3 className="text-[14px] font-bold text-gray-900 truncate pr-8">
          {category.name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          <Hash size={10} className="text-gray-300" />
          <p className="text-[10px] text-gray-400 font-mono truncate">
            {category.slug}
          </p>
        </div>

        {/* Sub-categories toggle */}
        {hasSubs && (
          <div className="mt-3">
            <button
              onClick={() => setSubOpen((o) => !o)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#004b9c] hover:text-[#003a7a] transition-colors"
            >
              <Layers size={11} />
              {category.subCategories.length} sub-categor
              {category.subCategories.length === 1 ? "y" : "ies"}
              <motion.div
                animate={{ rotate: subOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={11} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {subOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1 mt-2">
                    {category.subCategories.map((sc) => (
                      <span
                        key={sc.slug}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium"
                      >
                        {sc.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-2.5">
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
              c.slug.toLowerCase().includes(q) ||
              c.subCategories?.some((s) => s.name.toLowerCase().includes(q)),
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

  const stats = {
    total: categories.length,
    withImage: categories.filter((c) => c.image).length,
    noImage: categories.filter((c) => !c.image).length,
    totalSubs: categories.reduce(
      (acc, c) => acc + (c.subCategories?.length ?? 0),
      0,
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="space-y-6 max-w-[1600px] mx-auto p-6">
        {/* Header */}
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
                Category Management
              </h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Organize products into categories and sub-categories
              </p>
            </div>
            <button
              onClick={() => {
                setEditTarget(undefined);
                setModalMode("add");
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#25D366] to-[#20b859] hover:shadow-lg transition-all"
            >
              <Plus size={16} /> Add New Category
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Categories"
            value={stats.total}
            icon={<Tag size={18} className="text-white" />}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            title="Sub-categories"
            value={stats.totalSubs}
            icon={<Layers size={18} className="text-white" />}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="With Images"
            value={stats.withImage}
            icon={<ImageIcon size={18} className="text-white" />}
            color="from-emerald-500 to-teal-500"
          />
          <StatsCard
            title="No Image"
            value={stats.noImage}
            icon={<FolderOpen size={18} className="text-white" />}
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
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories, sub-categories or slug…"
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

        {/* Categories Display */}
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
              <FolderOpen size={32} className="text-gray-400" />
            </div>
            <p className="text-[16px] font-bold text-gray-700 mb-1">
              {search ? "No categories match your search" : "No categories yet"}
            </p>
            <p className="text-[13px] text-gray-400 mb-5 max-w-sm">
              {search
                ? "Try a different keyword or clear the search filter"
                : "Create your first category to organise your products"}
            </p>
            {!search ? (
              <button
                onClick={() => {
                  setEditTarget(undefined);
                  setModalMode("add");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold bg-gradient-to-r from-[#004b9c] to-[#0062cc] shadow-md"
              >
                <Plus size={14} /> Add First Category
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            </div>
            <div className="flex justify-between items-center text-[12px] text-gray-400 pt-2">
              <p>
                Showing {filtered.length} of {categories.length} categories
              </p>
            </div>
          </>
        )}

        {/* Modals */}
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

        <AnimatePresence>
          {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
