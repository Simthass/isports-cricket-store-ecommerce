"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User, Lock, MapPin, ShoppingBag, Bell, ChevronRight,
  Save, Eye, EyeOff, CheckCircle2, Package, Truck,
  LogOut, Loader2,
} from "lucide-react";

const DUMMY_ORDERS = [
  { id: "ISP-2024-001", date: "12 Mar 2026", total: "AED 649", status: "Delivered", statusColor: "text-green-600 bg-green-50" },
  { id: "ISP-2024-002", date: "28 Feb 2026", total: "AED 299", status: "Shipped", statusColor: "text-blue-600 bg-blue-50" },
  { id: "ISP-2024-003", date: "10 Feb 2026", total: "AED 178", status: "Processing", statusColor: "text-amber-600 bg-amber-50" },
];

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "orders", label: "My Orders", icon: ShoppingBag },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const orderStatusIcon = (status: string) => {
  if (status === "Delivered") return <CheckCircle2 size={14} />;
  if (status === "Shipped") return <Truck size={14} />;
  return <Package size={14} />;
};

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  // Profile form — initialized from session
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    smsAlerts: false,
  });

  // ── Populate profile from session when it loads ──
  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
        dob: (session.user as any).dob || "",
      });
    }
  }, [session]);

  // ── Redirect to login if not authenticated ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#004b9c] animate-spin" />
          <p className="text-gray-400 text-[14px] font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!session?.user) return null;

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || "??";

  // ── Save profile ──
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          dob: profile.dob,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Failed to save. Please try again.");
      } else {
        // Update session with new name
        await update({ name: profile.name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Save password ──
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
      const res = await fetch("/api/user/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Failed to update password.");
      } else {
        setSaved(true);
        setPasswords({ current: "", newPass: "", confirm: "" });
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Banner ── */}
      <section className="bg-[#004b9c] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #81bf42 0%, transparent 60%)" }}
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
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white font-black text-xl">
                  {initials}
                </div>
                <div>
                  <h1 className="text-white text-3xl lg:text-4xl font-black italic uppercase">
                    {user.name || "My Account"}
                  </h1>
                  <p className="text-blue-200 text-[14px] mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold tracking-wider uppercase transition-all duration-200 border border-white/20"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-2 mb-1">
              Settings
            </p>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSaveError("");
                    setSaved(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#004b9c] text-white shadow-[0_4px_16px_rgba(0,75,156,0.3)]"
                      : "text-gray-600 hover:bg-white hover:text-[#004b9c] border border-transparent hover:border-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                    {tab.label}
                  </span>
                  <ChevronRight size={14} className={isActive ? "text-white/60" : "text-gray-300"} />
                </button>
              );
            })}

            {/* Sign out — sidebar */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all duration-150 mt-2"
            >
              <LogOut size={16} strokeWidth={1.8} />
              Sign Out
            </button>
          </div>

          {/* ── Content Panel ── */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8"
            >

              {/* ── Error / Success alerts ── */}
              {saveError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-600 text-[13px] font-medium">
                  ⚠️ {saveError}
                </div>
              )}

              {/* ── PROFILE TAB ── */}
              {activeTab === "profile" && (
                <>
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: "Full Name", key: "name", type: "text", placeholder: "Your full name" },
                      { label: "Email Address", key: "email", type: "email", placeholder: "your@email.com", disabled: true },
                      { label: "Phone Number", key: "phone", type: "tel", placeholder: "+971 XX XXX XXXX" },
                      { label: "Date of Birth", key: "dob", type: "date", placeholder: "" },
                    ].map(({ label, key, type, placeholder, disabled }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                          {label}
                          {disabled && <span className="ml-2 text-gray-300 normal-case font-normal">(cannot change)</span>}
                        </label>
                        <input
                          type={type}
                          value={profile[key as keyof typeof profile]}
                          onChange={(e) =>
                            !disabled && setProfile({ ...profile, [key]: e.target.value })
                          }
                          placeholder={placeholder}
                          disabled={disabled}
                          className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all ${
                            disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-bold tracking-wider shadow-[0_4px_16px_rgba(0,75,156,0.3)] active:scale-[0.97] transition-all duration-200 disabled:opacity-60"
                    >
                      {saving
                        ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        : <><Save size={15} /> SAVE CHANGES</>
                      }
                    </button>
                    {saved && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[#81bf42] text-[13px] font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={15} /> Saved successfully!
                      </motion.p>
                    )}
                  </div>
                </>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === "security" && (
                <>
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6">Change Password</h2>
                  <div className="flex flex-col gap-5 max-w-md">
                    {[
                      { label: "Current Password", key: "current" },
                      { label: "New Password", key: "newPass" },
                      { label: "Confirm New Password", key: "confirm" },
                    ].map(({ label, key }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                          {label}
                        </label>
                        <div className="relative">
                          <input
                            type={showPass ? "text" : "password"}
                            value={passwords[key as keyof typeof passwords]}
                            onChange={(e) =>
                              setPasswords({ ...passwords, [key]: e.target.value })
                            }
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <p className="text-[12px] text-gray-400">
                      Password must be at least 8 characters with uppercase, lowercase, number and special character.
                    </p>
                    <button
                      onClick={handleSavePassword}
                      disabled={saving}
                      className="self-start flex items-center gap-2 px-7 py-3 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-bold tracking-wider shadow-[0_4px_16px_rgba(0,75,156,0.3)] active:scale-[0.97] transition-all duration-200 disabled:opacity-60"
                    >
                      {saving
                        ? <><Loader2 size={14} className="animate-spin" /> Updating...</>
                        : <><Lock size={14} /> UPDATE PASSWORD</>
                      }
                    </button>
                    {saved && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[#81bf42] text-[13px] font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={15} /> Password updated!
                      </motion.p>
                    )}
                  </div>
                </>
              )}

              {/* ── ADDRESSES TAB ── */}
              {activeTab === "addresses" && (
                <>
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6">Saved Addresses</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-[#004b9c] rounded-2xl p-5 relative">
                      <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#004b9c] text-white px-2.5 py-1 rounded-full">
                        DEFAULT
                      </span>
                      <p className="font-bold text-gray-800 text-[14px]">{user.name}</p>
                      <p className="text-gray-500 text-[13px] mt-1 leading-relaxed">
                        No address saved yet.<br />Add your delivery address below.
                      </p>
                      <div className="flex gap-3 mt-4">
                        <button className="text-[12px] font-semibold text-[#004b9c] hover:underline">Edit</button>
                        <button className="text-[12px] font-semibold text-red-400 hover:underline">Delete</button>
                      </div>
                    </div>
                    <button className="border border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#004b9c] hover:text-[#004b9c] transition-all duration-200 min-h-[160px]">
                      <MapPin size={28} strokeWidth={1.4} />
                      <span className="text-[13px] font-semibold">+ Add New Address</span>
                    </button>
                  </div>
                </>
              )}

              {/* ── ORDERS TAB ── */}
              {activeTab === "orders" && (
                <>
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6">Order History</h2>
                  <div className="flex flex-col gap-4">
                    {DUMMY_ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between flex-wrap gap-4 border border-gray-100 rounded-2xl px-5 py-4 hover:border-[#004b9c]/30 hover:bg-blue-50/30 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#004b9c]">
                            {orderStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-[14px]">{order.id}</p>
                            <p className="text-gray-400 text-[12px]">{order.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <p className="font-bold text-[#004b9c] text-[15px]">{order.total}</p>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${order.statusColor}`}>
                            {orderStatusIcon(order.status)} {order.status}
                          </span>
                          <button className="text-[12px] font-semibold text-gray-400 hover:text-[#004b9c] flex items-center gap-1 transition-colors">
                            View <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === "notifications" && (
                <>
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6">Notification Preferences</h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { key: "orderUpdates", label: "Order Updates", desc: "Get notified when your order status changes" },
                      { key: "promotions", label: "Promotions & Deals", desc: "Receive exclusive offers and discount codes" },
                      { key: "newArrivals", label: "New Arrivals", desc: "Be the first to know about new cricket gear" },
                      { key: "smsAlerts", label: "SMS Alerts", desc: "Receive notifications via SMS to your mobile" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4 border border-gray-100 rounded-2xl px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 text-[14px]">{label}</p>
                          <p className="text-gray-400 text-[12px] mt-0.5">{desc}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [key]: !notifications[key as keyof typeof notifications],
                            })
                          }
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                            notifications[key as keyof typeof notifications] ? "bg-[#004b9c]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                              notifications[key as keyof typeof notifications] ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
                    className="mt-6 flex items-center gap-2 px-7 py-3 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-bold tracking-wider shadow-[0_4px_16px_rgba(0,75,156,0.3)] active:scale-[0.97] transition-all duration-200"
                  >
                    <Save size={15} /> SAVE PREFERENCES
                  </button>
                  {saved && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-[#81bf42] text-[13px] font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Preferences saved!
                    </motion.p>
                  )}
                </>
              )}

            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}