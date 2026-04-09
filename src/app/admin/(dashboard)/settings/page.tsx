"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Lock,
  LogOut,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Link2,
  Hash,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

interface SiteSettings {
  // Basic Info
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  favicon: string;
  logo: string;
  logoDark?: string;

  // Contact Info
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;

  // Social Media
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImage: string;

  // Admin Settings
  sessionTimeoutHours: number;
  singleDeviceOnly: boolean;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

// Social Icon Component (Custom SVG)
function SocialIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    facebook: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    instagram: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
    twitter: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
    youtube: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
    tiktok: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.58a6.34 6.34 0 0 0 8.88 5.3 6.34 6.34 0 0 0 3.73-5.3V8.42a7.32 7.32 0 0 0 4.28 1.42V6.33a4.57 4.57 0 0 1-2.3-.64z" />
      </svg>
    ),
  };

  return icons[platform] || null;
}

// Toast Component
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
        className="ml-auto text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// Password Change Modal
function PasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error || "Failed to change password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,22,40,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-[#004b9c] to-[#0062cc] px-6 py-4">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Lock size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">
                  Change Password
                </h3>
                <p className="text-[10px] text-blue-100">
                  Update your admin password
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-gray-500 hover:text-[#004b9c] flex items-center gap-1"
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#004b9c] to-[#0062cc] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Logout All Devices Modal
function LogoutAllModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,22,40,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <LogOut size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white">
                Logout All Devices
              </h3>
              <p className="text-[10px] text-amber-100">
                This will sign you out from all active sessions
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-[13px] text-gray-600 mb-6">
            Are you sure? You will be logged out from all devices including this
            one. You'll need to sign in again.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-[13px] font-bold hover:shadow-lg transition-all"
            >
              Logout All
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [logoutAllModal, setLogoutAllModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "contact" | "social" | "seo" | "security"
  >("general");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
      }
    } catch (error) {
      showToast("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Settings saved successfully");
      } else {
        showToast("error", json.error || "Failed to save settings");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  // Logout all devices
  const handleLogoutAll = async () => {
    try {
      const res = await fetch("/api/admin/settings/logout-all", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Logged out from all devices");
        setTimeout(() => {
          signOut({ callbackUrl: "/admin/login" });
        }, 1000);
      }
    } catch {
      showToast("error", "Failed to logout from all devices");
    }
    setLogoutAllModal(false);
  };

  const updateField = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const sessionTimeoutOptions = [
    { value: 1, label: "1 Hour" },
    { value: 2, label: "2 Hours" },
    { value: 5, label: "5 Hours" },
    { value: 24, label: "1 Day" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social Media", icon: Link2 },
    { id: "seo", label: "SEO", icon: TrendingUp },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="space-y-6 max-w-[1400px] mx-auto p-6">
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
                  Configuration
                </span>
              </div>
              <h1 className="text-[28px] font-black tracking-tight">
                General Settings
              </h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Manage your store configuration and admin preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r from-[#25D366] to-[#20b859] hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#004b9c] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            {/* General Tab */}
            {activeTab === "general" && settings && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => updateField("siteTitle", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) =>
                      updateField("siteDescription", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Site Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={settings.siteKeywords?.join(", ") || ""}
                    onChange={(e) =>
                      updateField(
                        "siteKeywords",
                        e.target.value.split(",").map((k) => k.trim()),
                      )
                    }
                    placeholder="cricket, sports, UAE, cricket equipment"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={settings.logo}
                      onChange={(e) => updateField("logo", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      Favicon URL
                    </label>
                    <input
                      type="text"
                      value={settings.favicon}
                      onChange={(e) => updateField("favicon", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && settings && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <Phone size={12} className="inline mr-1" /> Phone Number
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <Mail size={12} className="inline mr-1" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <Smartphone size={12} className="inline mr-1" /> WhatsApp
                      Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) =>
                        updateField("whatsappNumber", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <MapPin size={12} className="inline mr-1" /> Address
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Tab - Using custom SVGs */}
            {activeTab === "social" && settings && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <div className="inline-flex items-center gap-1.5 mr-1 text-blue-600">
                        <SocialIcon platform="facebook" />
                      </div>
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={settings.facebook}
                      onChange={(e) => updateField("facebook", e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <div className="inline-flex items-center gap-1.5 mr-1 text-pink-600">
                        <SocialIcon platform="instagram" />
                      </div>
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={settings.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <div className="inline-flex items-center gap-1.5 mr-1 text-blue-400">
                        <SocialIcon platform="twitter" />
                      </div>
                      Twitter/X
                    </label>
                    <input
                      type="text"
                      value={settings.twitter}
                      onChange={(e) => updateField("twitter", e.target.value)}
                      placeholder="https://twitter.com/yourpage"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                      <div className="inline-flex items-center gap-1.5 mr-1 text-red-600">
                        <SocialIcon platform="youtube" />
                      </div>
                      YouTube
                    </label>
                    <input
                      type="text"
                      value={settings.youtube}
                      onChange={(e) => updateField("youtube", e.target.value)}
                      placeholder="https://youtube.com/yourchannel"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    <div className="inline-flex items-center gap-1.5 mr-1 text-gray-700">
                      <SocialIcon platform="tiktok" />
                    </div>
                    TikTok
                  </label>
                  <input
                    type="text"
                    value={settings.tiktok}
                    onChange={(e) => updateField("tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@yourpage"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && settings && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="Leave empty to use site title"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) =>
                      updateField("metaDescription", e.target.value)
                    }
                    rows={3}
                    placeholder="Leave empty to use site description"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    value={settings.ogImage}
                    onChange={(e) => updateField("ogImage", e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && settings && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Lock size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800">
                          Change Password
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Update your admin account password
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPasswordModal(true)}
                      className="px-4 py-2 rounded-xl bg-[#004b9c] text-white text-[12px] font-bold hover:bg-[#003d82] transition-all"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Session Timeout */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Clock size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-800">
                        Session Timeout
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Auto logout after inactivity
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {sessionTimeoutOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          updateField("sessionTimeoutHours", opt.value)
                        }
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                          settings.sessionTimeoutHours === opt.value
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-white border border-purple-200 text-purple-700 hover:bg-purple-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">
                    Current:{" "}
                    {sessionTimeoutOptions.find(
                      (o) => o.value === settings.sessionTimeoutHours,
                    )?.label || "1 Hour"}
                  </p>
                </div>

                {/* Single Device Mode */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Shield size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800">
                          Single Device Mode
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Only one device can be logged in at a time
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        updateField(
                          "singleDeviceOnly",
                          !settings.singleDeviceOnly,
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                        settings.singleDeviceOnly
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {settings.singleDeviceOnly ? "Enabled ✓" : "Disabled"}
                    </button>
                  </div>
                </div>

                {/* Logout All Devices */}
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <LogOut size={16} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800">
                          Logout All Devices
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Sign out from all active sessions
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setLogoutAllModal(true)}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white text-[12px] font-bold hover:bg-red-600 transition-all"
                    >
                      Logout All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {passwordModal && (
          <PasswordModal
            onClose={() => setPasswordModal(false)}
            onSuccess={() =>
              showToast("success", "Password changed successfully")
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logoutAllModal && (
          <LogoutAllModal
            onClose={() => setLogoutAllModal(false)}
            onConfirm={handleLogoutAll}
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
