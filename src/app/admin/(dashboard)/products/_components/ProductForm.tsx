"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  GripVertical,
  Star,
  Zap,
  Award,
  Tag,
  DollarSign,
  Package,
  Hash,
  FileText,
  Palette,
  Ruler,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ICategory {
  _id: string;
  name: string;
  slug: string;
}
interface IBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface UploadedImage {
  id: string; // local temp id
  url: string; // cloudinary or preview url
  uploading?: boolean;
  error?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  categoryId: string;
  brandId: string;
  stockQty: string;
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  // optional toggleable
  enableSizes: boolean;
  sizes: string[];
  sizeInput: string;
  enableColors: boolean;
  colors: string[];
  colorInput: string;
}

interface ProductFormProps {
  mode: "new" | "edit";
  productId?: string;
}

// ── Colour swatches for quick pick ────────────────────────────
const COLOR_PRESETS = [
  { label: "Black", hex: "#000000" },
  { label: "White", hex: "#FFFFFF" },
  { label: "Red", hex: "#EF4444" },
  { label: "Blue", hex: "#3B82F6" },
  { label: "Navy", hex: "#1E3A5F" },
  { label: "Green", hex: "#22C55E" },
  { label: "Yellow", hex: "#EAB308" },
  { label: "Gray", hex: "#6B7280" },
  { label: "Gold", hex: "#D97706" },
  { label: "Maroon", hex: "#7F1D1D" },
];

// ── Section wrapper ───────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center">
          <Icon size={14} style={{ color: "#004b9c" }} />
        </div>
        <h3 className="text-[13px] font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────
function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10",
        props.className,
      )}
    />
  );
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
  description,
  accent = "#004b9c",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-3.5 rounded-xl border transition-all hover:bg-gray-50"
      style={{
        borderColor: checked ? `${accent}30` : "#e5e7eb",
        backgroundColor: checked ? `${accent}06` : undefined,
      }}
    >
      <div className="text-left">
        <p className="text-[13px] font-semibold text-gray-800">{label}</p>
        {description && (
          <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0 ml-3">
        {checked ? (
          <ToggleRight size={26} style={{ color: accent }} />
        ) : (
          <ToggleLeft size={26} className="text-gray-300" />
        )}
      </div>
    </button>
  );
}

// ── Image Upload Zone ─────────────────────────────────────────
function ImageUploadZone({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || !json.success)
      throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const remaining = 10 - images.filter((i) => !i.error).length;
      const toProcess = Array.from(files).slice(0, remaining);
      if (!toProcess.length) return;

      // Add placeholders
      const placeholders: UploadedImage[] = toProcess.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(f),
        uploading: true,
      }));
      onChange([...images, ...placeholders]);

      // Upload each
      const updated = [...images, ...placeholders];
      for (let i = 0; i < toProcess.length; i++) {
        try {
          const url = await uploadFile(toProcess[i]);
          const idx = updated.findIndex((img) => img.id === placeholders[i].id);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], url, uploading: false };
            onChange([...updated]);
          }
        } catch (err) {
          const idx = updated.findIndex((img) => img.id === placeholders[i].id);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              uploading: false,
              error: "Upload failed",
            };
            onChange([...updated]);
          }
        }
      }
    },
    [images, onChange, uploadFile],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function removeImage(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
          dragOver
            ? "border-[#004b9c] bg-[#e8f0fb]/60"
            : "border-gray-200 hover:border-[#004b9c]/50 hover:bg-gray-50/50",
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#e8f0fb] flex items-center justify-center">
          <Upload size={20} style={{ color: "#004b9c" }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-bold text-gray-700">
            Drop images here or click to upload
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            JPG, PNG, WebP · Max 5MB each · Up to 10 images
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Image grid with drag-to-reorder */}
      {images.length > 0 && (
        <div>
          <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
            <GripVertical size={11} /> Drag to reorder · First image is the
            cover
          </p>
          <Reorder.Group
            axis="x"
            values={images}
            onReorder={onChange}
            className="flex flex-wrap gap-2.5"
          >
            {images.map((img, idx) => (
              <Reorder.Item
                key={img.id}
                value={img}
                className="relative flex-shrink-0 cursor-grab active:cursor-grabbing"
              >
                <div
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                    idx === 0 ? "border-[#004b9c]" : "border-gray-200",
                    img.error ? "border-red-300 opacity-60" : "",
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <Loader2 size={16} className="text-white animate-spin" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-xl">
                      <AlertCircle size={16} className="text-red-500" />
                    </div>
                  )}
                </div>
                {/* Cover badge */}
                {idx === 0 && (
                  <div
                    className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black text-white"
                    style={{ background: "#004b9c" }}
                  >
                    COVER
                  </div>
                )}
                {/* Remove */}
                {!img.uploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────
export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    brandId: "",
    stockQty: "0",
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    enableSizes: false,
    sizes: [],
    sizeInput: "",
    enableColors: false,
    colors: [],
    colorInput: "",
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load categories + brands
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([cats, brds]) => {
      if (cats.success) setCategories(cats.data);
      if (brds.success) setBrands(brds.data);
    });
  }, []);

  // Load existing product for edit mode
  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    setPageLoading(true);
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const p = json.data;
        setForm({
          name: p.name ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          originalPrice: String(p.originalPrice ?? ""),
          categoryId: p.categoryId?._id ?? p.categoryId ?? "",
          brandId: p.brandId?._id ?? p.brandId ?? "",
          stockQty: String(p.stockQty ?? 0),
          inStock: p.inStock ?? true,
          isNew: p.isNew ?? false,
          isBestSeller: p.isBestSeller ?? false,
          isFeatured: p.isFeatured ?? false,
          enableSizes: (p.sizes ?? []).length > 0,
          sizes: p.sizes ?? [],
          sizeInput: "",
          enableColors: (p.colors ?? []).length > 0,
          colors: p.colors ?? [],
          colorInput: "",
        });
        setImages(
          (p.images ?? []).map((url: string) => ({
            id: url,
            url,
            uploading: false,
          })),
        );
      })
      .finally(() => setPageLoading(false));
  }, [mode, productId]);

  function setField<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key])
      setErrors((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
  }

  // ── Sizes ────────────────────────────────────────────────────
  function addSize() {
    const val = form.sizeInput.trim();
    if (!val || form.sizes.includes(val)) return;
    setField("sizes", [...form.sizes, val]);
    setField("sizeInput", "");
  }
  function removeSize(s: string) {
    setField(
      "sizes",
      form.sizes.filter((x) => x !== s),
    );
  }

  // ── Colors ───────────────────────────────────────────────────
  function addColor(val: string) {
    const v = val.trim();
    if (!v || form.colors.includes(v)) return;
    setField("colors", [...form.colors, v]);
    setField("colorInput", "");
  }
  function removeColor(c: string) {
    setField(
      "colors",
      form.colors.filter((x) => x !== c),
    );
  }

  // ── Validate ─────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Valid price is required";
    if (
      form.originalPrice &&
      (isNaN(Number(form.originalPrice)) || Number(form.originalPrice) <= 0)
    )
      e.originalPrice = "Must be a valid positive number";
    if (!form.categoryId) e.categoryId = "Category is required";
    if (!form.brandId) e.brandId = "Brand is required";
    const validImages = images.filter((i) => !i.uploading && !i.error);
    if (validImages.length === 0) e.images = "At least one image is required";
    if (images.some((i) => i.uploading))
      e.images = "Please wait for all images to finish uploading";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    // Ensure proper data types
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      images: images.filter((i) => !i.uploading && !i.error).map((i) => i.url),
      categoryId: form.categoryId,
      brandId: form.brandId,
      stockQty: Number(form.stockQty) || 0,
      inStock: form.inStock,
      isNew: form.isNew,
      isBestSeller: form.isBestSeller,
      isFeatured: form.isFeatured,
      sizes: form.enableSizes ? form.sizes : [],
      colors: form.enableColors ? form.colors : [],
    };

    console.log("Sending payload:", payload); // Debug log

    try {
      const url =
        mode === "new" ? "/api/products" : `/api/products/${productId}`;
      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("Response:", json); // Debug log

      if (!res.ok || !json.success) {
        const errMsg = json.details
          ? Object.values(json.details).flat().join(", ")
          : json.error || "Failed to save product";
        setToast({ type: "error", message: errMsg });
        return;
      }

      setToast({
        type: "success",
        message: mode === "new" ? "Product created!" : "Product updated!",
      });
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      console.error("Submit error:", err);
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="space-y-4 max-w-[900px] animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {[160, 120, 200].map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="space-y-4">
            {[120, 100, 140].map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100"
                style={{ height: h }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="max-w-[900px] space-y-5">
      {/* Page header */}
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
            className="text-[22px] font-black text-gray-900 tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {mode === "new" ? "Add New Product" : "Edit Product"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Section title="Basic Information" icon={FileText}>
                <div className="space-y-4">
                  <Field label="Product Name" required error={errors.name}>
                    <Input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="e.g. SS Ton Ranger Cricket Bat"
                      error={errors.name}
                    />
                  </Field>
                  <Field
                    label="Description"
                    hint="Markdown supported. Describe features, specs, material."
                  >
                    <textarea
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      rows={5}
                      placeholder="Describe the product in detail…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all outline-none resize-none"
                    />
                  </Field>
                </div>
              </Section>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <Section title="Product Images" icon={ImageIcon}>
                <ImageUploadZone images={images} onChange={setImages} />
                {errors.images && (
                  <p className="text-[11px] text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {errors.images}
                  </p>
                )}
              </Section>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.11 }}
            >
              <Section title="Pricing" icon={DollarSign}>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Selling Price (AED)"
                    required
                    error={errors.price}
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
                        AED
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="0.00"
                        error={errors.price}
                        className="pl-12"
                      />
                    </div>
                  </Field>
                  <Field
                    label="Original Price (AED)"
                    hint="Leave empty if no discount"
                    error={errors.originalPrice}
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
                        AED
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.originalPrice}
                        onChange={(e) =>
                          setField("originalPrice", e.target.value)
                        }
                        placeholder="0.00"
                        error={errors.originalPrice}
                        className="pl-12"
                      />
                    </div>
                  </Field>
                </div>
                {form.originalPrice &&
                  form.price &&
                  Number(form.originalPrice) > Number(form.price) && (
                    <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <p className="text-[12px] font-semibold text-green-700">
                        {Math.round(
                          (1 -
                            Number(form.price) / Number(form.originalPrice)) *
                            100,
                        )}
                        % discount applied
                      </p>
                    </div>
                  )}
              </Section>
            </motion.div>

            {/* Optional: Sizes */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
            >
              <Section title="Sizes" icon={Ruler}>
                <div className="space-y-3">
                  <Toggle
                    checked={form.enableSizes}
                    onChange={(v) => setField("enableSizes", v)}
                    label="Enable size options"
                    description="Let customers choose a size when ordering"
                  />
                  <AnimatePresence>
                    {form.enableSizes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={form.sizeInput}
                              onChange={(e) =>
                                setField("sizeInput", e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addSize())
                              }
                              placeholder="e.g. Short Handle, Long Handle, SH, 5, 6…"
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={addSize}
                              className="px-4 py-3 rounded-xl text-white text-[12px] font-bold flex-shrink-0 flex items-center gap-1.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #004b9c, #0062cc)",
                              }}
                            >
                              <Plus size={13} /> Add
                            </button>
                          </div>
                          {form.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {form.sizes.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8f0fb] border border-[#004b9c]/20 text-[12px] font-semibold text-[#004b9c]"
                                >
                                  {s}
                                  <button
                                    type="button"
                                    onClick={() => removeSize(s)}
                                    className="hover:text-red-500 transition-colors"
                                  >
                                    <X size={11} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>
            </motion.div>

            {/* Optional: Colors */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.17 }}
            >
              <Section title="Colors" icon={Palette}>
                <div className="space-y-3">
                  <Toggle
                    checked={form.enableColors}
                    onChange={(v) => setField("enableColors", v)}
                    label="Enable colour options"
                    description="Let customers choose a colour variant"
                  />
                  <AnimatePresence>
                    {form.enableColors && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 space-y-3">
                          {/* Quick colour swatches */}
                          <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() => addColor(c.label)}
                                disabled={form.colors.includes(c.label)}
                                title={c.label}
                                className={cn(
                                  "w-7 h-7 rounded-lg border-2 transition-all hover:scale-110",
                                  form.colors.includes(c.label)
                                    ? "border-[#004b9c] opacity-40 cursor-not-allowed"
                                    : "border-transparent hover:border-gray-400",
                                )}
                                style={{
                                  backgroundColor: c.hex,
                                  boxShadow:
                                    c.hex === "#FFFFFF"
                                      ? "0 0 0 1px #e5e7eb inset"
                                      : undefined,
                                }}
                              />
                            ))}
                          </div>
                          {/* Custom color input */}
                          <div className="flex gap-2">
                            <Input
                              value={form.colorInput}
                              onChange={(e) =>
                                setField("colorInput", e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addColor(form.colorInput))
                              }
                              placeholder="Custom colour name…"
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => addColor(form.colorInput)}
                              className="px-4 py-3 rounded-xl text-white text-[12px] font-bold flex-shrink-0 flex items-center gap-1.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #004b9c, #0062cc)",
                              }}
                            >
                              <Plus size={13} /> Add
                            </button>
                          </div>
                          {form.colors.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {form.colors.map((c) => {
                                const preset = COLOR_PRESETS.find(
                                  (p) => p.label === c,
                                );
                                return (
                                  <span
                                    key={c}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[12px] font-semibold text-gray-700"
                                  >
                                    {preset && (
                                      <span
                                        className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: preset.hex }}
                                      />
                                    )}
                                    {c}
                                    <button
                                      type="button"
                                      onClick={() => removeColor(c)}
                                      className="hover:text-red-500 transition-colors"
                                    >
                                      <X size={11} />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────── */}
          <div className="space-y-4">
            {/* Category & Brand */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
            >
              <Section title="Category & Brand" icon={Tag}>
                <div className="space-y-4">
                  <Field label="Category" required error={errors.categoryId}>
                    <div className="relative">
                      <select
                        value={form.categoryId}
                        onChange={(e) => setField("categoryId", e.target.value)}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all outline-none appearance-none cursor-pointer",
                          errors.categoryId
                            ? "border-red-300"
                            : "border-gray-200",
                        )}
                      >
                        <option value="">Select category…</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </Field>
                  <Field label="Brand" required error={errors.brandId}>
                    <div className="relative">
                      <select
                        value={form.brandId}
                        onChange={(e) => setField("brandId", e.target.value)}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all outline-none appearance-none cursor-pointer",
                          errors.brandId ? "border-red-300" : "border-gray-200",
                        )}
                      >
                        <option value="">Select brand…</option>
                        {brands.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </Field>
                </div>
              </Section>
            </motion.div>

            {/* Inventory */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.09 }}
            >
              <Section title="Inventory" icon={Package}>
                <div className="space-y-4">
                  <Field label="Stock Quantity">
                    <div className="relative">
                      <Hash
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={form.stockQty}
                        onChange={(e) => setField("stockQty", e.target.value)}
                        placeholder="0"
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  <Toggle
                    checked={form.inStock}
                    onChange={(v) => setField("inStock", v)}
                    label="Available for sale"
                    description="Show as In Stock on the store"
                    accent="#16a34a"
                  />
                </div>
              </Section>
            </motion.div>

            {/* Product Labels */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <Section title="Product Labels" icon={Award}>
                <div className="space-y-2.5">
                  <Toggle
                    checked={form.isFeatured}
                    onChange={(v) => setField("isFeatured", v)}
                    label="Featured Product"
                    description="Shown in homepage featured section"
                    accent="#f59e0b"
                  />
                  <Toggle
                    checked={form.isNew}
                    onChange={(v) => setField("isNew", v)}
                    label="New Arrival"
                    description="Shows NEW badge on product"
                    accent="#3b82f6"
                  />
                  <Toggle
                    checked={form.isBestSeller}
                    onChange={(v) => setField("isBestSeller", v)}
                    label="Best Seller"
                    description="Shows BESTSELLER badge on product"
                    accent="#16a34a"
                  />
                </div>
              </Section>
            </motion.div>

            {/* Save button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl text-white text-[14px] font-black flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 shadow-[0_6px_20px_rgba(0,75,156,0.28)] hover:shadow-[0_8px_24px_rgba(0,75,156,0.35)]"
                style={{
                  background: "linear-gradient(135deg, #004b9c, #0062cc)",
                }}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving
                  ? "Saving…"
                  : mode === "new"
                    ? "Create Product"
                    : "Save Changes"}
              </button>
              {Object.keys(errors).length > 0 && (
                <p className="text-[11px] text-red-500 mt-2 text-center flex items-center justify-center gap-1">
                  <AlertCircle size={10} /> Fix the errors above before saving
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </form>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className={cn(
              "fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold max-w-sm",
              toast.type === "success"
                ? "bg-white border-green-100 text-green-800"
                : "bg-white border-red-100 text-red-700",
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                size={17}
                className="text-green-500 flex-shrink-0"
              />
            ) : (
              <AlertCircle size={17} className="text-red-500 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
