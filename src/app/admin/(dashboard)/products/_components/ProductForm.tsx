// src/app/admin/products/_components/ProductForm.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  GripVertical,
  Save,
  ArrowLeft,
  Tag,
  DollarSign,
  Package,
  Hash,
  FileText,
  Palette,
  Ruler,
  ChevronDown,
  ImageIcon,
  Award,
  ToggleLeft,
  ToggleRight,
  Layers,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ICategory {
  _id: string;
  name: string;
}
interface IBrand {
  _id: string;
  name: string;
  logo?: string;
}

interface UploadedImage {
  id: string;
  url: string;
  uploading?: boolean;
  error?: string;
}

interface SizeOption {
  id: string;
  label: string;
  price: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  categoryId: string;
  brandId: string;
  stockQty: string;
  inStock: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isHeroProduct: boolean;
  heroOrder: number;
  enableSizes: boolean;
  enableSizePrice: boolean;
  sizeOptions: SizeOption[];
  sizeInput: string;
  sizePriceInput: string;
  enableColors: boolean;
  colors: string[];
  colorInput: string;
}

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

// ── Tiny helpers ──────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
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

function InputEl({
  error,
  className,
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
        className,
      )}
    />
  );
}

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

// ── Drag-to-reorder image grid ────────────────────────────────
function ImageGrid({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (imgs: UploadedImage[]) => void;
}) {
  const dragIndex = useRef<number | null>(null);

  function onDragStart(i: number) {
    dragIndex.current = i;
  }

  function onDrop(i: number) {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, moved);
    dragIndex.current = null;
    onChange(next);
  }

  function remove(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  return (
    <div className="flex flex-wrap gap-3 mt-1">
      {images.map((img, i) => (
        <div
          key={img.id}
          draggable={!img.uploading}
          onDragStart={() => onDragStart(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(i)}
          className={cn(
            "relative w-[88px] h-[88px] rounded-xl overflow-hidden border-2 transition-all select-none",
            img.uploading
              ? "opacity-70 cursor-wait"
              : "cursor-grab active:cursor-grabbing",
            i === 0
              ? "border-[#004b9c]"
              : "border-gray-200 hover:border-gray-300",
            img.error ? "border-red-300" : "",
          )}
        >
          <img
            src={img.url}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
          />

          {img.uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 size={18} className="text-white animate-spin" />
            </div>
          )}
          {img.error && !img.uploading && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-500" />
            </div>
          )}
          {!img.uploading && (
            <div className="absolute bottom-0 inset-x-0 flex justify-center py-0.5 bg-black/20">
              <GripVertical size={12} className="text-white/80" />
            </div>
          )}
          {i === 0 && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black text-white bg-[#004b9c]">
              COVER
            </div>
          )}
          {!img.uploading && (
            <button
              type="button"
              onClick={() => remove(img.id)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Image Upload Zone ─────────────────────────────────────────
function ImageUploadZone({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (imgs: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok || !json.success)
      throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/avif",
      ];
      const toProcess = Array.from(files)
        .filter((f) => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024)
        .slice(0, 10 - images.filter((i) => !i.error).length);

      if (!toProcess.length) return;

      const placeholders: UploadedImage[] = toProcess.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(f),
        uploading: true,
      }));

      onChange([...images, ...placeholders]);

      for (let i = 0; i < toProcess.length; i++) {
        try {
          const url = await uploadFile(toProcess[i]);
          onChange((prev) =>
            prev.map((img) =>
              img.id === placeholders[i].id
                ? { ...img, url, uploading: false }
                : img,
            ),
          );
        } catch {
          onChange((prev) =>
            prev.map((img) =>
              img.id === placeholders[i].id
                ? { ...img, uploading: false, error: "Upload failed" }
                : img,
            ),
          );
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

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all",
          dragOver
            ? "border-[#004b9c] bg-[#e8f0fb]/50"
            : "border-gray-200 hover:border-[#004b9c]/50 hover:bg-gray-50/50",
        )}
      >
        <div className="w-11 h-11 rounded-2xl bg-[#e8f0fb] flex items-center justify-center">
          <Upload size={18} style={{ color: "#004b9c" }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-bold text-gray-700">
            Drop images here or click to upload
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            JPG, PNG, WebP · Max 5MB · Up to 10 images
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

      {images.length > 0 && (
        <>
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <GripVertical size={11} />
            Drag images to reorder · First image is the cover
          </p>
          <ImageGrid images={images} onChange={onChange} />
        </>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────
export default function ProductForm({
  mode,
  productId,
}: {
  mode: "new" | "edit";
  productId?: string;
}) {
  const router = useRouter();

  // Track existing hero products to disable taken orders
  const [existingHeroProducts, setExistingHeroProducts] = useState<
    Array<{ _id: string; heroOrder: number }>
  >([]);

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    brandId: "",
    stockQty: "0",
    inStock: true,
    isNewArrival: false,
    isFeatured: false,
    isTrending: false,
    isHeroProduct: false,
    heroOrder: 1,
    enableSizes: false,
    enableSizePrice: false,
    sizeOptions: [],
    sizeInput: "",
    sizePriceInput: "",
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

  // Load existing hero products to know which orders are taken
  useEffect(() => {
    const fetchExistingHeroProducts = async () => {
      try {
        const res = await fetch("/api/home/hero");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          // Exclude current product if editing
          const heroes = json.data
            .filter((p: any) => p._id !== productId)
            .map((p: any) => ({ _id: p._id, heroOrder: p.heroOrder }));
          setExistingHeroProducts(heroes);
        }
      } catch (error) {
        console.error("Error fetching hero products:", error);
      }
    };
    fetchExistingHeroProducts();
  }, [productId]);

  // Load categories & brands
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([cats, brds]) => {
      if (cats.success) setCategories(cats.data);
      if (brds.success) setBrands(brds.data);
    });
  }, []);

  // Load product for edit
  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    setPageLoading(true);
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const p = json.data;
        const hasSizeOptions =
          Array.isArray(p.sizeOptions) && p.sizeOptions.length > 0;
        setForm({
          name: p.name ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          originalPrice: String(p.originalPrice ?? ""),
          categoryId: p.categoryId?._id ?? p.categoryId ?? "",
          brandId: p.brandId?._id ?? p.brandId ?? "",
          stockQty: String(p.stockQty ?? 0),
          inStock: p.inStock ?? true,
          isNewArrival: p.isNewArrival ?? false,
          isFeatured: p.isFeatured ?? false,
          isTrending: p.isTrending ?? false,
          isHeroProduct: p.isHeroProduct ?? false,
          heroOrder: p.heroOrder ?? 1,
          enableSizes: hasSizeOptions || (p.sizes ?? []).length > 0,
          enableSizePrice: p.enableSizePrice ?? false,
          sizeOptions: hasSizeOptions
            ? p.sizeOptions.map((s: { label: string; price: number }) => ({
                id: `${Date.now()}-${Math.random()}`,
                label: s.label,
                price: String(s.price),
              }))
            : (p.sizes ?? []).map((s: string) => ({
                id: `${Date.now()}-${Math.random()}`,
                label: s,
                price: "",
              })),
          sizeInput: "",
          sizePriceInput: "",
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

  const setF = useCallback(
    <K extends keyof FormData>(key: K, val: FormData[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
      if (errors[key])
        setErrors((e) => {
          const n = { ...e };
          delete n[key];
          return n;
        });
    },
    [errors],
  );

  // Get available hero orders (1-3) excluding taken ones
  const getAvailableHeroOrders = () => {
    const takenOrders = existingHeroProducts
      .filter((p) => p.heroOrder > 0)
      .map((p) => p.heroOrder);

    const available = [];
    for (let i = 1; i <= 3; i++) {
      if (!takenOrders.includes(i) || form.heroOrder === i) {
        available.push(i);
      }
    }
    return available;
  };

  // Handle hero product toggle
  const handleHeroToggle = (checked: boolean) => {
    setF("isHeroProduct", checked);
    if (checked) {
      setF("isTrending", false);
      setF("isFeatured", false);
      setF("isNewArrival", false);

      // Auto-select first available order
      const availableOrders = getAvailableHeroOrders();
      if (
        availableOrders.length > 0 &&
        !existingHeroProducts.some((p) => p.heroOrder === form.heroOrder)
      ) {
        setF("heroOrder", availableOrders[0]);
      }
    }
  };

  // Handle hero order change
  const handleHeroOrderChange = (order: number) => {
    setF("heroOrder", order);
  };

  // Sizes
  function addSize() {
    const label = form.sizeInput.trim();
    const price = form.sizePriceInput.trim();
    if (!label) return;
    if (form.sizeOptions.some((s) => s.label === label)) return;
    setF("sizeOptions", [
      ...form.sizeOptions,
      { id: `${Date.now()}`, label, price },
    ]);
    setF("sizeInput", "");
    setF("sizePriceInput", "");
  }
  function removeSize(id: string) {
    setF(
      "sizeOptions",
      form.sizeOptions.filter((s) => s.id !== id),
    );
  }
  function updateSizePrice(id: string, price: string) {
    setF(
      "sizeOptions",
      form.sizeOptions.map((s) => (s.id === id ? { ...s, price } : s)),
    );
  }

  // Colors
  function addColor(val: string) {
    const v = val.trim();
    if (!v || form.colors.includes(v)) return;
    setF("colors", [...form.colors, v]);
    setF("colorInput", "");
  }
  function removeColor(c: string) {
    setF(
      "colors",
      form.colors.filter((x) => x !== c),
    );
  }

  // Validate
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (!form.enableSizePrice) {
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
        e.price = "Valid price is required";
    } else {
      if (form.sizeOptions.length === 0)
        e.sizes = "Add at least one size with a price";
      if (
        form.sizeOptions.some(
          (s) => !s.price || isNaN(Number(s.price)) || Number(s.price) <= 0,
        )
      )
        e.sizes = "All sizes need a valid price";
    }
    if (
      form.originalPrice &&
      (isNaN(Number(form.originalPrice)) || Number(form.originalPrice) <= 0)
    )
      e.originalPrice = "Must be a valid positive number";
    if (!form.categoryId) e.categoryId = "Category is required";
    if (!form.brandId) e.brandId = "Brand is required";
    const validImgs = images.filter((i) => !i.uploading && !i.error);
    if (validImgs.length === 0) e.images = "At least one image is required";
    if (images.some((i) => i.uploading))
      e.images = "Please wait for uploads to finish";

    // Hero order validation
    if (form.isHeroProduct) {
      const availableOrders = getAvailableHeroOrders();
      if (!availableOrders.includes(form.heroOrder)) {
        e.heroOrder = "This hero position is already taken by another product";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);

    const sizeOptsPayload =
      form.enableSizes && form.enableSizePrice
        ? form.sizeOptions.map((s) => ({
            label: s.label,
            price: Number(s.price),
          }))
        : [];

    const simpleLabels =
      form.enableSizes && !form.enableSizePrice
        ? form.sizeOptions.map((s) => s.label)
        : [];

    const basePrice =
      form.enableSizePrice && sizeOptsPayload.length > 0
        ? sizeOptsPayload[0].price
        : Number(form.price);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: basePrice,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      images: images.filter((i) => !i.uploading && !i.error).map((i) => i.url),
      categoryId: form.categoryId,
      brandId: form.brandId,
      stockQty: Number(form.stockQty) || 0,
      inStock: form.inStock,
      isNewArrival: form.isNewArrival,
      isFeatured: form.isFeatured,
      isTrending: form.isTrending,
      isHeroProduct: form.isHeroProduct,
      heroOrder: form.isHeroProduct ? form.heroOrder : 0,
      sizes: simpleLabels,
      sizeOptions: sizeOptsPayload,
      enableSizePrice: form.enableSizePrice,
      colors: form.enableColors ? form.colors : [],
    };

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
      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          message:
            typeof json.error === "string"
              ? json.error
              : "Failed to save product",
        });
        return;
      }
      setToast({
        type: "success",
        message: mode === "new" ? "Product created!" : "Product updated!",
      });
      setTimeout(() => router.push("/admin/products"), 1100);
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const discountPct =
    form.originalPrice &&
    form.price &&
    Number(form.originalPrice) > Number(form.price)
      ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)
      : null;

  const availableHeroOrders = getAvailableHeroOrders();

  if (pageLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {[180, 240, 160, 140, 140].map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="space-y-4">
            {[160, 140, 180, 200, 56].map((h, i) => (
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

  return (
    <div className="space-y-5">
      {/* Page Header */}
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
          {/* ── LEFT col ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
            >
              <Section title="Basic Information" icon={FileText}>
                <div className="space-y-4">
                  <Field label="Product Name" required error={errors.name}>
                    <InputEl
                      value={form.name}
                      onChange={(e) => setF("name", e.target.value)}
                      placeholder="e.g. SS Ton Ranger Cricket Bat"
                      error={errors.name}
                    />
                  </Field>
                  <Field
                    label="Description"
                    hint="Describe features, materials and specifications."
                  >
                    <textarea
                      value={form.description}
                      onChange={(e) => setF("description", e.target.value)}
                      rows={5}
                      placeholder="Describe the product…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all outline-none resize-none"
                    />
                  </Field>
                </div>
              </Section>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Section title="Pricing" icon={DollarSign}>
                <div className="space-y-4">
                  {!form.enableSizePrice && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Selling Price (AED)"
                        required
                        error={errors.price}
                      >
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">
                            AED
                          </span>
                          <InputEl
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setF("price", e.target.value)}
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
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">
                            AED
                          </span>
                          <InputEl
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.originalPrice}
                            onChange={(e) =>
                              setF("originalPrice", e.target.value)
                            }
                            placeholder="0.00"
                            error={errors.originalPrice}
                            className="pl-12"
                          />
                        </div>
                      </Field>
                    </div>
                  )}
                  {form.enableSizePrice && (
                    <div>
                      <Field
                        label="Original Price (AED)"
                        hint="Leave empty if no discount"
                        error={errors.originalPrice}
                      >
                        <div className="relative w-48">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">
                            AED
                          </span>
                          <InputEl
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.originalPrice}
                            onChange={(e) =>
                              setF("originalPrice", e.target.value)
                            }
                            placeholder="0.00"
                            className="pl-12"
                          />
                        </div>
                      </Field>
                      <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-[#004b9c]" />
                        Price per size is enabled — enter individual prices in
                        the Sizes section below.
                      </p>
                    </div>
                  )}
                  {discountPct !== null && (
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <p className="text-[12px] font-semibold text-green-700">
                        {discountPct}% discount applied
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            </motion.div>

            {/* Sizes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
            >
              <Section title="Sizes" icon={Ruler}>
                <div className="space-y-3">
                  <Toggle
                    checked={form.enableSizes}
                    onChange={(v) => setF("enableSizes", v)}
                    label="Enable size options"
                    description="Customers can choose a size when ordering"
                  />

                  <AnimatePresence>
                    {form.enableSizes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-3">
                          <Toggle
                            checked={form.enableSizePrice}
                            onChange={(v) => setF("enableSizePrice", v)}
                            label="Different price per size"
                            description="Each size has its own selling price"
                            accent="#f59e0b"
                          />

                          <div
                            className={cn(
                              "grid gap-2",
                              form.enableSizePrice
                                ? "grid-cols-[1fr_120px_auto]"
                                : "grid-cols-[1fr_auto]",
                            )}
                          >
                            <InputEl
                              value={form.sizeInput}
                              onChange={(e) =>
                                setF("sizeInput", e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addSize())
                              }
                              placeholder="Size label (e.g. Short Handle)"
                            />
                            {form.enableSizePrice && (
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                  AED
                                </span>
                                <InputEl
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={form.sizePriceInput}
                                  onChange={(e) =>
                                    setF("sizePriceInput", e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), addSize())
                                  }
                                  placeholder="Price"
                                  className="pl-10"
                                />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={addSize}
                              className="px-4 py-3 rounded-xl text-white text-[12px] font-bold flex items-center gap-1 flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, #004b9c, #0062cc)",
                              }}
                            >
                              <Plus size={13} /> Add
                            </button>
                          </div>

                          {errors.sizes && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1">
                              <AlertCircle size={10} />
                              {errors.sizes}
                            </p>
                          )}

                          {form.sizeOptions.length > 0 && (
                            <div className="space-y-2">
                              {form.sizeOptions.map((s) => (
                                <div
                                  key={s.id}
                                  className="flex items-center gap-2"
                                >
                                  <span className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#e8f0fb] border border-[#004b9c]/15 text-[12.5px] font-semibold text-[#004b9c]">
                                    <Ruler size={12} /> {s.label}
                                  </span>
                                  {form.enableSizePrice && (
                                    <div className="relative w-36 flex-shrink-0">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                        AED
                                      </span>
                                      <InputEl
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={s.price}
                                        onChange={(e) =>
                                          updateSizePrice(s.id, e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="pl-10 py-2 text-[12px]"
                                      />
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeSize(s.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all flex-shrink-0"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
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

            {/* Colors */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <Section title="Colors" icon={Palette}>
                <div className="space-y-3">
                  <Toggle
                    checked={form.enableColors}
                    onChange={(v) => setF("enableColors", v)}
                    label="Enable colour options"
                    description="Customers can choose a colour variant"
                  />
                  <AnimatePresence>
                    {form.enableColors && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-3">
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
                          <div className="flex gap-2">
                            <InputEl
                              value={form.colorInput}
                              onChange={(e) =>
                                setF("colorInput", e.target.value)
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
                              className="px-4 py-3 rounded-xl text-white text-[12px] font-bold flex items-center gap-1 flex-shrink-0"
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
                                        className="w-3 h-3 rounded-full border border-gray-300"
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

          {/* ── RIGHT col ────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Category & Brand */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Section title="Category & Brand" icon={Tag}>
                <div className="space-y-4">
                  <Field label="Category" required error={errors.categoryId}>
                    <div className="relative">
                      <select
                        value={form.categoryId}
                        onChange={(e) => setF("categoryId", e.target.value)}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 outline-none appearance-none cursor-pointer transition-all",
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
                        onChange={(e) => setF("brandId", e.target.value)}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 outline-none appearance-none cursor-pointer transition-all",
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <Section title="Inventory" icon={Package}>
                <div className="space-y-4">
                  <Field label="Stock Quantity">
                    <div className="relative">
                      <Hash
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <InputEl
                        type="number"
                        min="0"
                        value={form.stockQty}
                        onChange={(e) => setF("stockQty", e.target.value)}
                        placeholder="0"
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  <Toggle
                    checked={form.inStock}
                    onChange={(v) => setF("inStock", v)}
                    label="Available for sale"
                    description="Show as In Stock on the store"
                    accent="#16a34a"
                  />
                </div>
              </Section>
            </motion.div>

            {/* Product Labels */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.11 }}
            >
              <Section title="Product Labels" icon={Award}>
                <div className="space-y-2.5">
                  <Toggle
                    checked={form.isFeatured}
                    onChange={(v) => setF("isFeatured", v)}
                    label="Featured Product"
                    description="Shown in homepage featured section"
                    accent="#f59e0b"
                  />
                  <Toggle
                    checked={form.isNewArrival}
                    onChange={(v) => setF("isNewArrival", v)}
                    label="New Arrival"
                    description="Shows NEW badge on product"
                    accent="#3b82f6"
                  />
                  <Toggle
                    checked={form.isTrending}
                    onChange={(v) => setF("isTrending", v)}
                    label="Trending Product"
                    description="Appears in trending products section"
                    accent="#8b5cf6"
                  />
                </div>
              </Section>
            </motion.div>

            {/* Section Assignment */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <Section title="Section Assignment" icon={Layers}>
                <div className="space-y-3">
                  <Toggle
                    checked={form.isHeroProduct}
                    onChange={handleHeroToggle}
                    label="Show in Hero Slider"
                    description="Product appears in homepage hero slider (max 3 products)"
                    accent="#f59e0b"
                  />

                  {form.isHeroProduct && (
                    <div className="ml-6 pl-4 border-l-2 border-[#f59e0b]/30">
                      <Field
                        label="Hero Position"
                        hint="Select position in hero slider (1-3)"
                        error={errors.heroOrder}
                      >
                        <div className="relative">
                          <select
                            value={form.heroOrder}
                            onChange={(e) =>
                              handleHeroOrderChange(parseInt(e.target.value))
                            }
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 bg-gray-50 focus:bg-white focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 outline-none appearance-none cursor-pointer transition-all",
                              errors.heroOrder
                                ? "border-red-300"
                                : "border-gray-200",
                            )}
                          >
                            {[1, 2, 3].map((order) => {
                              const isTaken = existingHeroProducts.some(
                                (p) =>
                                  p.heroOrder === order && p._id !== productId,
                              );
                              return (
                                <option
                                  key={order}
                                  value={order}
                                  disabled={isTaken && form.heroOrder !== order}
                                >
                                  Position {order}{" "}
                                  {isTaken && form.heroOrder !== order
                                    ? "(Already taken)"
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </Field>
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <Info size={10} />
                        Position 1 appears first, position 3 appears last
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    <Info size={10} />
                    Products can only belong to one section at a time (Hero
                    takes priority)
                  </p>
                </div>
              </Section>
            </motion.div>

            {/* Save */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
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
