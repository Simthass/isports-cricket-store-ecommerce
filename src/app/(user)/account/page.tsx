"use client";

// app/account/page.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  MapPin,
  Bell,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  LogOut,
  Loader2,
  ChevronRight,
} from "lucide-react";

// ── Tab config (Removed orders and reviews tabs) ─────────────────────────────
const tabs = [
  { id: "profile", label: "Profile", icon: User, href: "/account" },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    href: "/account?tab=security",
  },
  {
    id: "addresses",
    label: "Addresses",
    icon: MapPin,
    href: "/account?tab=addresses",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/account?tab=notifications",
  },
];

// ── Notification toggle row ───────────────────────────────────────────────────
function NotifRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-[14px] font-semibold text-gray-800">{label}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#004b9c]" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const tabParam = searchParams?.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // ── Profile form ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    emirate: "",
  });

  // ── Password form ─────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // ── Notification settings ─────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    smsAlerts: false,
  });

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // ── Load user profile data from DB ─────────────────────────────────────────
  const loadUserData = useCallback(async () => {
    if (!session?.user) return;
    setLoadingData(true);
    try {
      const [profileRes, notifRes] = await Promise.all([
        fetch("/api/users/profile"),
        fetch("/api/users/notifications"),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile({
          name: data.name ?? "",
          email: data.email ?? session.user.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          emirate: data.emirate ?? "",
        });
      }

      if (notifRes.ok) {
        const data = await notifRes.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [session]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // ── Redirect if unauthenticated ───────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#004b9c] animate-spin" />
          <p className="text-gray-400 text-[14px] font-medium">
            Loading your account…
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (user.email?.slice(0, 2) ?? "??").toUpperCase();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          address: profile.address,
          city: profile.city,
          emirate: profile.emirate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save. Please try again.");
      } else {
        await update({ name: profile.name });
        flashSaved();
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    setSaveError("");
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setSaveError("All password fields are required.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setSaveError("New passwords do not match.");
      return;
    }
    if (passwords.newPass.length < 8) {
      setSaveError("New password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to update password.");
      } else {
        setPasswords({ current: "", newPass: "", confirm: "" });
        flashSaved();
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Save notifications ────────────────────────────────────────────────────
  const handleSaveNotifications = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/users/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save notification settings.");
      } else {
        if (data.notifications) setNotifications(data.notifications);
        flashSaved();
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <section className="bg-[#004b9c] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #81bf42 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#81bf42] text-[12px] font-bold tracking-[0.2em] uppercase mb-3">
              Account
            </p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white font-black text-xl">
                  {initials}
                </div>
                <div>
                  <h1 className="text-white text-3xl lg:text-4xl font-black italic uppercase">
                    {profile.name || "My Account"}
                  </h1>
                  <p className="text-blue-200 text-[14px] mt-0.5">
                    {profile.email || user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold tracking-wider uppercase transition-all duration-200 border border-white/20"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </motion.div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-2 mb-1">
              Settings
            </p>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSaveError("");
                    setSaved(false);
                  }}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-150 text-left ${
                    isActive
                      ? "bg-[#004b9c] text-white shadow-[0_4px_16px_rgba(0,75,156,0.25)]"
                      : "text-gray-600 hover:bg-white hover:text-[#004b9c] hover:shadow-sm"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <tab.icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                    {tab.label}
                  </span>
                  <ChevronRight
                    size={14}
                    className={isActive ? "text-white/60" : "text-gray-300"}
                  />
                </Link>
              );
            })}
          </div>

          {/* Main panel */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* ── Profile tab ── */}
              {activeTab === "profile" && (
                <div className="p-8">
                  <h2 className="text-[18px] font-black text-gray-900 mb-6">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Your full name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="+971 50 000 0000"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                  </div>

                  {saveError && (
                    <p className="mt-4 text-[13px] text-red-500 font-medium">
                      {saveError}
                    </p>
                  )}
                  {saved && (
                    <p className="mt-4 text-[13px] text-green-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Profile saved!
                    </p>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#004b9c] hover:bg-[#003d82] disabled:bg-[#004b9c]/60 text-white text-[13px] font-bold tracking-wider rounded-xl transition-colors duration-150"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}

              {/* ── Security tab ── */}
              {activeTab === "security" && (
                <div className="p-8">
                  <h2 className="text-[18px] font-black text-gray-900 mb-2">
                    Change Password
                  </h2>
                  <p className="text-[13px] text-gray-400 mb-6">
                    Use a strong password of at least 8 characters.
                  </p>

                  <div className="flex flex-col gap-5 max-w-md">
                    {(["current", "newPass", "confirm"] as const).map(
                      (field) => {
                        const labels: Record<typeof field, string> = {
                          current: "Current Password",
                          newPass: "New Password",
                          confirm: "Confirm New Password",
                        };
                        return (
                          <div key={field}>
                            <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                              {labels[field]}
                            </label>
                            <div className="relative">
                              <input
                                type={showPass ? "text" : "password"}
                                value={passwords[field]}
                                onChange={(e) =>
                                  setPasswords((p) => ({
                                    ...p,
                                    [field]: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-[14px] text-gray-800 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                              />
                              {field === "current" && (
                                <button
                                  type="button"
                                  onClick={() => setShowPass((v) => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPass ? (
                                    <EyeOff size={15} />
                                  ) : (
                                    <Eye size={15} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {saveError && (
                    <p className="mt-4 text-[13px] text-red-500 font-medium">
                      {saveError}
                    </p>
                  )}
                  {saved && (
                    <p className="mt-4 text-[13px] text-green-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Password updated!
                    </p>
                  )}

                  <button
                    onClick={handleSavePassword}
                    disabled={saving}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#004b9c] hover:bg-[#003d82] disabled:bg-[#004b9c]/60 text-white text-[13px] font-bold tracking-wider rounded-xl transition-colors duration-150"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Lock size={14} />
                    )}
                    {saving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              )}

              {/* ── Addresses tab ── */}
              {activeTab === "addresses" && (
                <div className="p-8">
                  <h2 className="text-[18px] font-black text-gray-900 mb-6">
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, address: e.target.value }))
                        }
                        placeholder="Building, Street, Area"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, city: e.target.value }))
                        }
                        placeholder="Dubai"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Emirate
                      </label>
                      <input
                        type="text"
                        value={profile.emirate}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, emirate: e.target.value }))
                        }
                        placeholder="Dubai"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                  </div>

                  {saveError && (
                    <p className="mt-4 text-[13px] text-red-500 font-medium">
                      {saveError}
                    </p>
                  )}
                  {saved && (
                    <p className="mt-4 text-[13px] text-green-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Address saved!
                    </p>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#004b9c] hover:bg-[#003d82] disabled:bg-[#004b9c]/60 text-white text-[13px] font-bold tracking-wider rounded-xl transition-colors"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? "Saving…" : "Save Address"}
                  </button>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === "notifications" && (
                <div className="p-8">
                  <h2 className="text-[18px] font-black text-gray-900 mb-1">
                    Notification Preferences
                  </h2>
                  <p className="text-[13px] text-gray-400 mb-6">
                    Control which updates you receive from us.
                  </p>

                  <div className="flex flex-col">
                    <NotifRow
                      label="Order Updates"
                      description="Shipping confirmations, delivery status, and receipts."
                      checked={notifications.orderUpdates}
                      onChange={(v) =>
                        setNotifications((n) => ({ ...n, orderUpdates: v }))
                      }
                    />
                    <NotifRow
                      label="Promotions & Offers"
                      description="Discount codes, seasonal sales, and exclusive deals."
                      checked={notifications.promotions}
                      onChange={(v) =>
                        setNotifications((n) => ({ ...n, promotions: v }))
                      }
                    />
                    <NotifRow
                      label="New Arrivals"
                      description="Be the first to hear about new products and brands."
                      checked={notifications.newArrivals}
                      onChange={(v) =>
                        setNotifications((n) => ({ ...n, newArrivals: v }))
                      }
                    />
                    <NotifRow
                      label="SMS Alerts"
                      description="Receive critical updates via text message."
                      checked={notifications.smsAlerts}
                      onChange={(v) =>
                        setNotifications((n) => ({ ...n, smsAlerts: v }))
                      }
                    />
                  </div>

                  {saveError && (
                    <p className="mt-4 text-[13px] text-red-500 font-medium">
                      {saveError}
                    </p>
                  )}
                  {saved && (
                    <p className="mt-4 text-[13px] text-green-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Preferences saved!
                    </p>
                  )}

                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#004b9c] hover:bg-[#003d82] disabled:bg-[#004b9c]/60 text-white text-[13px] font-bold tracking-wider rounded-xl transition-colors"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? "Saving…" : "Save Preferences"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
