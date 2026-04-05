"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, Users, Clock, CheckCircle2, XCircle,
  AlertCircle, Search, X, Loader2, RefreshCw, Filter,
  ChevronDown, Eye, ToggleLeft, ToggleRight, Phone,
  ShoppingBag, Star, Zap, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface WALog {
  _id: string;
  to: string;
  customerName?: string;
  templateType: "abandoned_cart" | "order_confirmation" | "review_request" | "manual";
  message: string;
  status: "sent" | "failed" | "pending" | "opted_out";
  orderId?: string;
  productName?: string;
  sentAt: string;
  error?: string;
}

interface WAStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  optedOut: number;
  deliveryRate: number;
}

interface ManualMsg {
  phone: string;
  message: string;
}

type TemplateType = "all" | "abandoned_cart" | "order_confirmation" | "review_request" | "manual";
type StatusFilter = "all" | "sent" | "failed" | "pending" | "opted_out";

// ── Template metadata ─────────────────────────────────────────
const TEMPLATE_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  abandoned_cart:     { label: "Abandoned Cart",     color: "#f59e0b", bg: "#fef3c7", icon: ShoppingBag },
  order_confirmation: { label: "Order Confirmed",    color: "#004b9c", bg: "#e8f0fb", icon: CheckCircle2 },
  review_request:     { label: "Review Request",     color: "#8b5cf6", bg: "#ede9fe", icon: Star },
  manual:             { label: "Manual Message",     color: "#6b7280", bg: "#f3f4f6", icon: MessageCircle },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  sent:      { label: "Sent",      color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  failed:    { label: "Failed",    color: "#dc2626", bg: "#fef2f2", icon: XCircle },
  pending:   { label: "Pending",   color: "#d97706", bg: "#fffbeb", icon: Clock },
  opted_out: { label: "Opted Out", color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
};

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: { type: "success" | "error"; text: string }; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className={cn(
        "fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold max-w-sm",
        msg.type === "success" ? "bg-white border-green-100 text-green-800" : "bg-white border-red-100 text-red-700"
      )}>
      {msg.type === "success" ? <CheckCircle2 size={17} className="text-green-500" /> : <AlertCircle size={17} className="text-red-500" />}
      <span>{msg.text}</span>
      <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </motion.div>
  );
}

// ── Log detail modal ──────────────────────────────────────────
function LogModal({ log, onClose }: { log: WALog; onClose: () => void }) {
  const tmpl = TEMPLATE_META[log.templateType] ?? TEMPLATE_META.manual;
  const stat = STATUS_META[log.status] ?? STATUS_META.pending;
  const TIcon = tmpl.icon;
  const SIcon = stat.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,22,40,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: tmpl.bg }}>
              <TIcon size={16} style={{ color: tmpl.color }} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">{tmpl.label}</h3>
              <p className="text-[11px] text-gray-400">{new Date(log.sentAt).toLocaleString("en-AE")}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Recipient</p>
              <p className="text-[13px] font-semibold text-gray-800">{log.customerName ?? "—"}</p>
              <p className="text-[11.5px] text-gray-400 font-mono">{log.to}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border"
                style={{ color: stat.color, backgroundColor: stat.bg, borderColor: `${stat.color}20` }}>
                <SIcon size={11} /> {stat.label}
              </span>
            </div>
            {log.productName && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product</p>
                <p className="text-[13px] font-semibold text-gray-800">{log.productName}</p>
              </div>
            )}
            {log.orderId && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order</p>
                <p className="text-[13px] font-semibold text-gray-800 font-mono">#{log.orderId.slice(-6).toUpperCase()}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Message Sent</p>
            <div className="bg-[#e9fde8] rounded-2xl rounded-tl-sm px-4 py-3.5 border border-green-100">
              <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">{log.message}</p>
            </div>
          </div>
          {log.error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700">{log.error}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Send Manual Message Modal ─────────────────────────────────
function SendModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<ManualMsg>({ phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<ManualMsg>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<ManualMsg> = {};
    if (!form.phone.trim() || !/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid international phone number (e.g. +971526514666)";
    if (!form.message.trim() || form.message.trim().length < 5)
      e.message = "Message must be at least 5 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.replace(/\s/g, ""), message: form.message }),
      });
      const json = await res.json();
      if (res.ok && json.success) { onSuccess(); }
      else { setErrors({ message: json.error ?? "Failed to send message" }); }
    } catch { setErrors({ message: "Network error. Please try again." }); }
    finally { setLoading(false); }
  }

  const remaining = 1024 - form.message.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,22,40,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.93, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e9fde8] flex items-center justify-center">
              <Send size={15} style={{ color: "#25D366" }} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">Send Manual Message</h3>
              <p className="text-[11px] text-gray-400">Direct WhatsApp to any number</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"><X size={16} /></button>
        </div>
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="tel" value={form.phone}
                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: undefined })); }}
                placeholder="+971 52 651 4666"
                className={cn(
                  "w-full pl-9 pr-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none",
                  errors.phone ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                               : "border-gray-200 focus:border-[#25D366] focus:ring-2 focus:ring-green-100"
                )} />
            </div>
            {errors.phone && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={10} />{errors.phone}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-semibold text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <span className={cn("text-[10.5px] font-medium", remaining < 50 ? "text-red-500" : "text-gray-400")}>
                {remaining} chars left
              </span>
            </div>
            <textarea value={form.message} maxLength={1024}
              onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: undefined })); }}
              rows={5} placeholder="Type your message… (Reply STOP to opt-out)"
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-[13.5px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-all outline-none resize-none",
                errors.message ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                               : "border-gray-200 focus:border-[#25D366] focus:ring-2 focus:ring-green-100"
              )} />
            {errors.message && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={10} />{errors.message}</p>}
            <p className="text-[10.5px] text-gray-400 mt-1.5">
              ⚠️ Message will only send between 10:00 AM – 8:00 PM UAE time
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#25D366" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── WhatsApp Settings card ────────────────────────────────────
function SettingsCard() {
  const [settings, setSettings] = useState({
    abandonedCart:    true,
    orderConfirmation:true,
    reviewRequest:    true,
    activeHoursOnly:  true,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/whatsapp/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } finally { setSaving(false); }
  }

  const items = [
    { key: "abandonedCart",     label: "Abandoned Cart Reminder",  desc: "24hr follow-up when user clicks WhatsApp but doesn't reply",   accent: "#f59e0b" },
    { key: "orderConfirmation", label: "Order Confirmation",        desc: "Sent when admin marks order as PROCESSING",                    accent: "#004b9c" },
    { key: "reviewRequest",     label: "Review Request",            desc: "72hr after order is marked DELIVERED",                         accent: "#8b5cf6" },
    { key: "activeHoursOnly",   label: "Respect Active Hours",      desc: "Only send between 10:00 AM – 8:00 PM UAE time",                accent: "#16a34a" },
  ] as const;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-[#e9fde8] flex items-center justify-center">
          <Zap size={14} style={{ color: "#25D366" }} />
        </div>
        <h3 className="text-[13px] font-bold text-gray-800">Automation Settings</h3>
      </div>
      <div className="p-5 space-y-2.5">
        {items.map(item => (
          <button key={item.key} type="button"
            onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
            className="flex items-center justify-between w-full p-3.5 rounded-xl border transition-all hover:bg-gray-50"
            style={{
              borderColor: settings[item.key] ? `${item.accent}30` : "#e5e7eb",
              backgroundColor: settings[item.key] ? `${item.accent}06` : undefined,
            }}>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-gray-800">{item.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            {settings[item.key]
              ? <ToggleRight size={26} style={{ color: item.accent }} className="flex-shrink-0 ml-3" />
              : <ToggleLeft size={26} className="text-gray-300 flex-shrink-0 ml-3" />}
          </button>
        ))}
        <button onClick={save} disabled={saving}
          className="w-full mt-2 py-2.5 rounded-xl text-white text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{ background: "#25D366" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminWhatsAppPage() {
  const [logs, setLogs]               = useState<WALog[]>([]);
  const [stats, setStats]             = useState<WAStats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterTemplate, setFilterTemplate] = useState<TemplateType>("all");
  const [filterStatus, setFilterStatus]     = useState<StatusFilter>("all");
  const [viewLog, setViewLog]         = useState<WALog | null>(null);
  const [sendModal, setSendModal]     = useState(false);
  const [toast, setToast]             = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 });

  const showToast = useCallback((type: "success" | "error", text: string) => setToast({ type, text }), []);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search)          params.set("search", search);
      if (filterTemplate !== "all") params.set("templateType", filterTemplate);
      if (filterStatus   !== "all") params.set("status", filterStatus);

      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/whatsapp/logs?${params}`).then(r => r.json()),
        fetch("/api/admin/whatsapp/stats").then(r => r.json()),
      ]);

      if (logsRes.success) {
        setLogs(logsRes.data);
        setPagination(logsRes.pagination);
      }
      if (statsRes.success) setStats(statsRes.data);
    } catch { showToast("error", "Failed to load WhatsApp data"); }
    finally { setLoading(false); }
  }, [search, filterTemplate, filterStatus, showToast]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  async function handleOptOut(log: WALog) {
    try {
      const res  = await fetch(`/api/admin/whatsapp/opt-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: log.to }),
      });
      const json = await res.json();
      if (json.success) {
        setLogs(prev => prev.map(l => l.to === log.to ? { ...l, status: "opted_out" } : l));
        showToast("success", `${log.to} opted out`);
      }
    } catch { showToast("error", "Failed to opt out"); }
  }

  const StatBox = ({ label, value, icon: Icon, color, bg }: {
    label: string; value: number | string; icon: React.ElementType; color: string; bg: string;
  }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-[20px] font-black text-gray-900 leading-none">{value}</p>
        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-[1380px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#81bf42] tracking-[0.15em] uppercase mb-1">Messaging</p>
          <h2 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            WhatsApp Management
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchLogs(pagination.page)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCw size={13} /> Refresh
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setSendModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-[12px] font-bold rounded-xl shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
            style={{ background: "#25D366" }}>
            <Send size={14} /> Send Message
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatBox label="Total Sent"   value={stats.total}    icon={MessageCircle} color="#004b9c" bg="#e8f0fb" />
          <StatBox label="Delivered"    value={stats.sent}     icon={CheckCircle2}  color="#16a34a" bg="#f0fdf4" />
          <StatBox label="Failed"       value={stats.failed}   icon={XCircle}       color="#dc2626" bg="#fef2f2" />
          <StatBox label="Pending"      value={stats.pending}  icon={Clock}         color="#d97706" bg="#fffbeb" />
          <StatBox label="Opted Out"    value={stats.optedOut} icon={Users}         color="#6b7280" bg="#f3f4f6" />
          <StatBox label="Delivery Rate" value={`${stats.deliveryRate}%`} icon={BarChart3} color="#8b5cf6" bg="#ede9fe" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* ── Log table ── */}
        <div className="xl:col-span-3 space-y-4">
          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-3 flex-wrap bg-white rounded-2xl border border-gray-100 p-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by number or name…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#25D366] focus:ring-2 focus:ring-green-100 text-[13px] outline-none transition-all" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
            </div>
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select value={filterTemplate} onChange={e => setFilterTemplate(e.target.value as TemplateType)}
                className="pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] outline-none appearance-none cursor-pointer focus:border-[#25D366]">
                <option value="all">All Templates</option>
                <option value="abandoned_cart">Abandoned Cart</option>
                <option value="order_confirmation">Order Confirmed</option>
                <option value="review_request">Review Request</option>
                <option value="manual">Manual</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusFilter)}
                className="px-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] outline-none appearance-none cursor-pointer focus:border-[#25D366]">
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="opted_out">Opted Out</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[12px] text-gray-400 ml-auto">{pagination.total} messages</p>
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recipient</th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Template</th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Message</th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Sent</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-50 animate-pulse">
                          <td className="px-5 py-4"><div className="space-y-1.5"><div className="h-3 bg-gray-100 rounded w-28" /><div className="h-2.5 bg-gray-100 rounded w-20" /></div></td>
                          <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 bg-gray-100 rounded-lg w-24" /></td>
                          <td className="px-4 py-4 hidden md:table-cell"><div className="h-3 bg-gray-100 rounded w-40" /></td>
                          <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-lg w-16" /></td>
                          <td className="px-4 py-4 hidden lg:table-cell"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                          <td className="px-5 py-4"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto" /></td>
                        </tr>
                      ))
                    : logs.length === 0
                      ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <MessageCircle size={24} className="text-gray-300" />
                              </div>
                              <p className="text-[14px] font-bold text-gray-500">No messages found</p>
                              <p className="text-[12px] text-gray-400">WhatsApp messages will appear here once sent</p>
                            </div>
                          </td>
                        </tr>
                      )
                      : logs.map((log, i) => {
                          const tmpl = TEMPLATE_META[log.templateType] ?? TEMPLATE_META.manual;
                          const stat = STATUS_META[log.status] ?? STATUS_META.pending;
                          const TIcon = tmpl.icon;
                          const SIcon = stat.icon;
                          return (
                            <motion.tr key={log._id}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.025 }}
                              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3.5">
                                <p className="text-[13px] font-bold text-gray-900">{log.customerName ?? "Unknown"}</p>
                                <p className="text-[11px] text-gray-400 font-mono">{log.to}</p>
                              </td>
                              <td className="px-4 py-3.5 hidden sm:table-cell">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                                  style={{ color: tmpl.color, backgroundColor: tmpl.bg, borderColor: `${tmpl.color}20` }}>
                                  <TIcon size={10} /> {tmpl.label}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 hidden md:table-cell">
                                <p className="text-[12px] text-gray-500 truncate max-w-[200px]">{log.message}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                                  style={{ color: stat.color, backgroundColor: stat.bg, borderColor: `${stat.color}20` }}>
                                  <SIcon size={10} /> {stat.label}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 hidden lg:table-cell">
                                <p className="text-[12px] text-gray-500">
                                  {new Date(log.sentAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setViewLog(log)}
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#004b9c] hover:border-[#004b9c]/30 hover:bg-[#e8f0fb] transition-all"
                                    title="View full message">
                                    <Eye size={13} />
                                  </button>
                                  {log.status !== "opted_out" && (
                                    <button onClick={() => handleOptOut(log)}
                                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                      title="Opt out this number">
                                      <XCircle size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
                <p className="text-[12px] text-gray-400">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page === pagination.pages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <SettingsCard />
          </motion.div>

          {/* Template preview */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
              <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center">
                <MessageCircle size={14} style={{ color: "#004b9c" }} />
              </div>
              <h3 className="text-[13px] font-bold text-gray-800">Message Templates</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Abandoned Cart",  color: "#f59e0b", msg: "Hi [Name] 🏏 You were looking at [Product]. Still available — want us to hold it?\n\nReply STOP to opt-out" },
                { label: "Order Confirmed", color: "#004b9c", msg: "Great choice [Name]! Your order is being packed. Delivery: 24hrs. Payment: [method]\n\nReply STOP to opt-out" },
                { label: "Review Request",  color: "#8b5cf6", msg: "Hi [Name], how's your [Product]? Leave a review: [Link]. Reply OFFER for 10% off!\n\nReply STOP to opt-out" },
              ].map(t => (
                <div key={t.label} className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.color, backgroundColor: `${t.color}12` }}>
                    {t.label}
                  </div>
                  <div className="px-3 py-2.5 bg-[#e9fde8] border-t border-gray-100">
                    <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-line">{t.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewLog && <LogModal log={viewLog} onClose={() => setViewLog(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {sendModal && (
          <SendModal onClose={() => setSendModal(false)}
            onSuccess={() => { setSendModal(false); showToast("success", "Message sent!"); fetchLogs(1); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}