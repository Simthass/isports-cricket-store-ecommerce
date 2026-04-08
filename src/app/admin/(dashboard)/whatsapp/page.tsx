"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Phone,
  Send,
  Sparkles,
  Hash,
  Globe,
  Languages,
  AlertCircle,
  Search,
  Filter,
  Grid3x3,
  List,
  Clock,
  TrendingUp,
  Users,
  Star,
  Zap,
  ChevronRight,
  Menu,
  Settings2,
  FolderOpen,
  CopyCheck,
  MessageSquareQuote,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface Template {
  _id: string;
  title: string;
  category: string;
  shortcut: string;
  messageEnglish: string;
  messageArabic: string | null;
  hasArabic: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Category Data with Modern Design ─────────────────────────
const CATEGORIES = [
  {
    value: "abandoned_cart",
    label: "Abandoned Cart",
    icon: "🛒",
    color: "from-orange-500 to-red-500",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    description: "24h follow-up for hanging orders",
  },
  {
    value: "order_confirmation",
    label: "Order Confirmation",
    icon: "✅",
    color: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    description: "Sent when order is processing",
  },
  {
    value: "shipping",
    label: "Shipping & Delivery",
    icon: "🚚",
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    description: "Delivery updates, tracking info",
  },
  {
    value: "review_request",
    label: "Review Request",
    icon: "⭐",
    color: "from-amber-500 to-yellow-500",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    description: "Post-purchase Google reviews",
  },
  {
    value: "greeting",
    label: "Greeting / Welcome",
    icon: "👋",
    color: "from-teal-500 to-emerald-500",
    bgLight: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    description: "First response to customer",
  },
  {
    value: "payment",
    label: "Payment Related",
    icon: "💳",
    color: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    description: "COD, Tabby, Tamara, Cards",
  },
  {
    value: "product",
    label: "Product Questions",
    icon: "🏏",
    color: "from-rose-500 to-pink-500",
    bgLight: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    description: "Sizing, stock, specifications",
  },
  {
    value: "loyalty",
    label: "Loyalty & Discounts",
    icon: "🎁",
    color: "from-violet-500 to-fuchsia-500",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    description: "Returning customer offers",
  },
  {
    value: "other",
    label: "Other",
    icon: "📝",
    color: "from-gray-500 to-slate-500",
    bgLight: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    description: "Opt-out, general responses",
  },
];

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

// ── Template Card Component (Fixed) ───────────────────────────
function TemplateCard({
  template,
  onEdit,
  onDelete,
  onCopy,
  copiedId,
  language,
  onLanguageChange,
}: {
  template: Template;
  onEdit: (t: Template) => void;
  onDelete: (id: string) => void;
  onCopy: (msg: string, id: string) => void;
  copiedId: string | null;
  language: "english" | "arabic";
  onLanguageChange: (id: string, lang: "english" | "arabic") => void;
}) {
  const category =
    CATEGORIES.find((c) => c.value === template.category) || CATEGORIES[8];

  // FIXED: Safely get display message with fallback
  const getDisplayMessage = () => {
    if (language === "arabic" && template.messageArabic) {
      return template.messageArabic;
    }
    return template.messageEnglish || "No message content";
  };

  const displayMessage = getDisplayMessage();
  const hasArabicVersion = template.hasArabic && template.messageArabic;
  const isLongMessage = displayMessage.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white rounded-2xl border ${category.borderColor} overflow-hidden hover:shadow-xl transition-all duration-300`}
    >
      {/* Gradient top bar */}
      <div className={`h-1 bg-gradient-to-r ${category.color}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-[20px]">{category.icon}</span>
              <h3 className="text-[16px] font-bold text-gray-900">
                {template.title}
              </h3>
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full ${category.bgLight} ${category.textColor} border ${category.borderColor}`}
              >
                {category.label}
              </span>
              {template.shortcut && (
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  /{template.shortcut}
                </span>
              )}
            </div>

            {/* Language Toggle */}
            {hasArabicVersion && (
              <div className="flex items-center gap-1 mb-3 bg-gray-100 rounded-xl p-1 w-fit">
                <button
                  onClick={() => onLanguageChange(template._id, "english")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                    language === "english"
                      ? "bg-white shadow-sm text-[#004b9c]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Globe size={12} />
                  English
                </button>
                <button
                  onClick={() => onLanguageChange(template._id, "arabic")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                    language === "arabic"
                      ? "bg-white shadow-sm text-[#004b9c]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Languages size={12} />
                  العربية
                </button>
              </div>
            )}

            {/* Message Preview */}
            <div
              className={`mt-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 ${
                language === "arabic" ? "text-right" : ""
              }`}
              dir={language === "arabic" ? "rtl" : "ltr"}
            >
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {isLongMessage
                  ? displayMessage.substring(0, 200) + "..."
                  : displayMessage}
              </p>
            </div>

            {/* Variables */}
            {template.variables && template.variables.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                <span className="text-[10px] font-medium text-gray-400">
                  Variables:
                </span>
                {template.variables.map((v) => (
                  <code
                    key={v}
                    className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-mono"
                  >
                    {`{${v}}`}
                  </code>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-1">
        <button
          onClick={() => onCopy(displayMessage, template._id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#25D366] hover:bg-white transition-all duration-200"
          title="Copy message"
        >
          {copiedId === template._id ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
        <button
          onClick={() => onEdit(template)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#004b9c] hover:bg-white transition-all duration-200"
          title="Edit template"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(template._id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all duration-200"
          title="Delete template"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Template Modal (Fixed) ────────────────────────────────────
function TemplateModal({
  template,
  onSave,
  onClose,
}: {
  template?: Template | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: template?.title || "",
    category: template?.category || "other",
    shortcut: template?.shortcut || "",
    messageEnglish: template?.messageEnglish || "",
    messageArabic: template?.messageArabic || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeLang, setActiveLang] = useState<"english" | "arabic">("english");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.messageEnglish.trim())
      newErrors.messageEnglish = "English message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      title: form.title,
      category: form.category,
      shortcut: form.shortcut,
      messageEnglish: form.messageEnglish,
      messageArabic: form.messageArabic || null,
    });
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{([^}]+)\}/g) || [];
    return matches.map((m) => m.replace(/[{}]/g, ""));
  };

  const englishVariables = extractVariables(form.messageEnglish);
  const arabicVariables = extractVariables(form.messageArabic || "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#20b859] flex items-center justify-center shadow-lg">
              <MessageSquareQuote size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">
                {template ? "Edit Template" : "Create New Template"}
              </h3>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {template
                  ? "Update your message template"
                  : "Add a new quick reply template"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]"
        >
          {/* Basic Info - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                Template Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  setErrors({ ...errors, title: "" });
                }}
                placeholder="e.g., Abandoned Cart Follow-up"
                className={`w-full px-4 py-3 rounded-xl border text-[14px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] focus:border-[#004b9c] outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shortcut */}
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-2">
              Shortcut{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] font-mono">
                /
              </span>
              <input
                type="text"
                value={form.shortcut}
                onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                placeholder="welcome, shipping, price"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] focus:border-[#004b9c] outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Type /shortcut in WhatsApp to quickly use this template
            </p>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveLang("english")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                activeLang === "english"
                  ? "bg-[#004b9c] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Globe size={14} />
              English Message <span className="text-red-400">*</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("arabic")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                activeLang === "arabic"
                  ? "bg-[#004b9c] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Languages size={14} />
              Arabic Message <span className="text-gray-400">(Optional)</span>
            </button>
          </div>

          {/* English Message */}
          {activeLang === "english" && (
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                Message Content (English)
              </label>
              <textarea
                value={form.messageEnglish}
                onChange={(e) => {
                  setForm({ ...form, messageEnglish: e.target.value });
                  setErrors({ ...errors, messageEnglish: "" });
                }}
                rows={7}
                placeholder="Hi {customer_name}! 🏏 We noticed you were looking at {product_name}... Reply STOP to opt out"
                className={`w-full px-4 py-3 rounded-xl border text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none font-mono ${
                  errors.messageEnglish
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              />
              {errors.messageEnglish && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.messageEnglish}
                </p>
              )}

              {englishVariables.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[11px] font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                    <Zap size={12} /> Variables detected (will be replaced
                    automatically):
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {englishVariables.map((v) => (
                      <code
                        key={v}
                        className="text-[11px] bg-white text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200 font-mono"
                      >
                        {`{${v}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Arabic Message */}
          {activeLang === "arabic" && (
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                Message Content (Arabic) - Optional
              </label>
              <textarea
                value={form.messageArabic}
                onChange={(e) =>
                  setForm({ ...form, messageArabic: e.target.value })
                }
                rows={7}
                placeholder="مرحباً {customer_name}! 🏏 لاحظنا أنك كنت مهتم بـ {product_name}... رد STOP للإلغاء"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none font-mono text-right"
                dir="rtl"
              />

              {arabicVariables.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[11px] font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                    <Zap size={12} /> Variables detected:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {arabicVariables.map((v) => (
                      <code
                        key={v}
                        className="text-[11px] bg-white text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200 font-mono"
                      >
                        {`{${v}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legal Notice */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-amber-800">
                  UAE Legal Requirement
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Every message MUST include{" "}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">
                    "Reply STOP to opt out"
                  </code>{" "}
                  (English) or{" "}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">
                    "رد STOP للإلغاء"
                  </code>{" "}
                  (Arabic) at the end for compliance with UAE TRA regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#004b9c] to-[#0062cc] hover:shadow-lg transition-all"
            >
              {template ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function WhatsAppBasicPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewLanguage, setPreviewLanguage] = useState<"english" | "arabic">(
    "english",
  );
  const [templateLanguages, setTemplateLanguages] = useState<
    Record<string, "english" | "arabic">
  >({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load templates
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/templates");
      const json = await res.json();
      if (json.success) setTemplates(json.data);
    } catch (error) {
      console.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveTemplate = async (formData: any) => {
    try {
      const url = editingTemplate
        ? `/api/admin/whatsapp/templates/${editingTemplate._id}`
        : "/api/admin/whatsapp/templates";
      const method = editingTemplate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        showToast(
          "success",
          editingTemplate ? "Template updated" : "Template created",
        );
        fetchTemplates();
        setModalOpen(false);
        setEditingTemplate(null);
      } else {
        showToast("error", json.error || "Failed to save template");
      }
    } catch (error) {
      showToast("error", "Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/admin/whatsapp/templates/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Template deleted");
        fetchTemplates();
      }
    } catch (error) {
      showToast("error", "Failed to delete");
    }
  };

  const handleCopy = async (message: string, id: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("success", "Copied to clipboard!");
  };

  const getTemplateLanguage = (templateId: string): "english" | "arabic" => {
    return templateLanguages[templateId] || previewLanguage;
  };

  const setTemplateLanguage = (
    templateId: string,
    lang: "english" | "arabic",
  ) => {
    setTemplateLanguages((prev) => ({ ...prev, [templateId]: lang }));
  };

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  const getPreviewMessage = () => {
    if (selectedTemplate) {
      const lang = getTemplateLanguage(selectedTemplate._id);
      if (lang === "arabic" && selectedTemplate.messageArabic) {
        return selectedTemplate.messageArabic;
      }
      return selectedTemplate.messageEnglish || "";
    }
    return customMessage;
  };

  const generateWhatsAppLink = () => {
    if (!customerPhone.trim()) {
      showToast("error", "Enter a phone number");
      return;
    }

    let phone = customerPhone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "971" + phone.substring(1);
    if (!phone.startsWith("971")) phone = "971" + phone;
    if (!phone.startsWith("+")) phone = "+" + phone;

    const message = getPreviewMessage();
    if (!message.trim()) {
      showToast("error", "Please select a template or enter a message");
      return;
    }

    const encodedMsg = encodeURIComponent(message);
    const link = `https://wa.me/${phone}?text=${encodedMsg}`;
    window.open(link, "_blank");
    showToast("success", "Opening WhatsApp...");
  };

  const useTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t._id === templateId);
    if (template) {
      const lang = getTemplateLanguage(templateId);
      const message =
        lang === "arabic" && template.messageArabic
          ? template.messageArabic
          : template.messageEnglish;
      setCustomMessage(message || "");
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory =
      filterCategory === "all" || t.category === filterCategory;
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.messageEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.messageArabic && t.messageArabic.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Stats
  const stats = {
    total: templates.length,
    withArabic: templates.filter((t) => t.hasArabic).length,
    categories: new Set(templates.map((t) => t.category)).size,
    mostUsed: templates[0]?.title || "None",
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
                <div className="w-8 h-[3px] bg-[#25D366] rounded-full" />
                <span className="text-[#25D366] text-[11px] font-black tracking-[0.2em] uppercase">
                  Customer Communication
                </span>
              </div>
              <h1 className="text-[28px] font-black tracking-tight">
                WhatsApp Quick Replies
              </h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Pre-written templates in English & Arabic to respond to
                customers faster
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-[13px] font-bold bg-[#25D366] hover:bg-[#20b859] transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={16} /> New Template
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Templates"
            value={stats.total}
            icon={<MessageCircle size={18} className="text-white" />}
            color="from-blue-500 to-cyan-500"
            trend="+12% this month"
          />
          <StatsCard
            title="With Arabic"
            value={stats.withArabic}
            icon={<Languages size={18} className="text-white" />}
            color="from-emerald-500 to-teal-500"
          />
          <StatsCard
            title="Categories"
            value={stats.categories}
            icon={<FolderOpen size={18} className="text-white" />}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="Ready to Use"
            value={stats.total}
            icon={<CopyCheck size={18} className="text-white" />}
            color="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - WhatsApp Sender Tool */}
          <div className="lg:col-span-1 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#25D366]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#20b859] flex items-center justify-center shadow-lg">
                    <Send size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">
                      Send WhatsApp Message
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Click to chat with customer instantly
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Phone Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Customer Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[13px] focus:border-[#25D366] focus:ring-2 focus:ring-green-100 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Enter UAE number (05X XXX XXXX)
                  </p>
                </div>

                {/* Template Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Select Template
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => useTemplate(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-[13px] focus:border-[#25D366] outline-none bg-gray-50"
                    >
                      <option value="">-- Choose a template --</option>
                      {templates.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.title} {t.shortcut ? `(/${t.shortcut})` : ""}
                          {t.hasArabic ? " 🌐" : ""}
                        </option>
                      ))}
                    </select>

                    {selectedTemplate && selectedTemplate.hasArabic && (
                      <button
                        type="button"
                        onClick={() => {
                          const newLang =
                            getTemplateLanguage(selectedTemplate._id) ===
                            "english"
                              ? "arabic"
                              : "english";
                          setTemplateLanguage(selectedTemplate._id, newLang);
                          const template = templates.find(
                            (t) => t._id === selectedTemplate._id,
                          );
                          if (template) {
                            const message =
                              newLang === "arabic" && template.messageArabic
                                ? template.messageArabic
                                : template.messageEnglish;
                            setCustomMessage(message || "");
                          }
                        }}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-[12px] font-semibold hover:bg-gray-50 transition-all"
                      >
                        {getTemplateLanguage(selectedTemplate._id) ===
                        "english" ? (
                          <span className="flex items-center gap-1">🇬🇧 EN</span>
                        ) : (
                          <span className="flex items-center gap-1">🇦🇪 AR</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Preview */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Message Preview
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => {
                      setCustomMessage(e.target.value);
                      setSelectedTemplateId("");
                    }}
                    rows={6}
                    placeholder="Type your message here..."
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] focus:border-[#25D366] focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none ${
                      previewLanguage === "arabic" ? "text-right" : ""
                    }`}
                    dir={previewLanguage === "arabic" ? "rtl" : "ltr"}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={generateWhatsAppLink}
                  disabled={!customerPhone.trim() || !customMessage.trim()}
                  className="w-full py-3.5 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#20b859] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send size={14} />
                  Open WhatsApp Chat
                </button>
              </div>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border border-indigo-100 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Sparkles size={14} className="text-white" />
                </div>
                <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-wider">
                  Pro Tips
                </h4>
              </div>
              <ul className="space-y-3 text-[12px] text-gray-600">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Hash size={11} className="text-green-600" />
                  </div>
                  <span>
                    Use shortcuts like{" "}
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                      /shipping
                    </code>{" "}
                    to quickly find templates
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap size={11} className="text-blue-600" />
                  </div>
                  <span>
                    Personalize with{" "}
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{`{customer_name}`}</code>
                    ,{" "}
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{`{product_name}`}</code>{" "}
                    variables
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Languages size={11} className="text-amber-600" />
                  </div>
                  <span>
                    Add Arabic version for UAE customers (optional but
                    recommended)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle size={11} className="text-red-600" />
                  </div>
                  <span>
                    Always include "Reply STOP to opt out" for UAE compliance
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right Column - Templates List */}
          <div className="lg:col-span-2 space-y-4">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] outline-none"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#004b9c]" : "text-gray-500"}`}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#004b9c]" : "text-gray-500"}`}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Language Preview Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setPreviewLanguage("english")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      previewLanguage === "english"
                        ? "bg-white shadow-sm text-[#004b9c]"
                        : "text-gray-500"
                    }`}
                  >
                    <Globe size={12} /> EN
                  </button>
                  <button
                    onClick={() => setPreviewLanguage("arabic")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      previewLanguage === "arabic"
                        ? "bg-white shadow-sm text-[#004b9c]"
                        : "text-gray-500"
                    }`}
                  >
                    <Languages size={12} /> AR
                  </button>
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex gap-2 flex-wrap mt-4">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    filterCategory === "all"
                      ? "bg-[#004b9c] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({templates.length})
                </button>
                {CATEGORIES.map((cat) => {
                  const count = templates.filter(
                    (t) => t.category === cat.value,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setFilterCategory(cat.value)}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                        filterCategory === cat.value
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Templates Display */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                    <div className="h-16 bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-[18px] font-bold text-gray-700 mb-2">
                  No templates found
                </h3>
                <p className="text-[13px] text-gray-400 mb-5 max-w-sm mx-auto">
                  {searchQuery || filterCategory !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first quick reply template in English or Arabic"}
                </p>
                {searchQuery || filterCategory !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterCategory("all");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-bold inline-flex items-center gap-2"
                  >
                    <Filter size={14} /> Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004b9c] to-[#0062cc] text-white text-[12px] font-bold inline-flex items-center gap-2 shadow-md"
                  >
                    <Plus size={14} /> New Template
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    onEdit={(t) => {
                      setEditingTemplate(t);
                      setModalOpen(true);
                    }}
                    onDelete={handleDeleteTemplate}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    language={getTemplateLanguage(template._id)}
                    onLanguageChange={setTemplateLanguage}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    onEdit={(t) => {
                      setEditingTemplate(t);
                      setModalOpen(true);
                    }}
                    onDelete={handleDeleteTemplate}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    language={getTemplateLanguage(template._id)}
                    onLanguageChange={setTemplateLanguage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {modalOpen && (
            <TemplateModal
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onClose={() => {
                setModalOpen(false);
                setEditingTemplate(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-2xl flex items-center gap-2.5"
            >
              {toast.type === "success" ? (
                <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check size={13} className="text-green-400" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <X size={13} className="text-red-400" />
                </div>
              )}
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
