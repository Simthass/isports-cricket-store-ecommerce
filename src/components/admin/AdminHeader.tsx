"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Command,
  ShoppingBag,
  MessageCircle, // ADD THIS
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface AdminHeaderProps {
  session: { user?: SessionUser } | null;
}

const pageMeta: Record<string, { title: string; desc: string }> = {
  "/admin/dashboard": {
    title: "Dashboard",
    desc: "Store performance overview",
  },
  "/admin/products": { title: "Products", desc: "Manage product catalog" },
  "/admin/orders": { title: "Orders", desc: "Track customer orders" },
  "/admin/customers": { title: "Customers", desc: "Manage customer accounts" },
  "/admin/settings": { title: "Settings", desc: "Configure store settings" },
  "/admin/notifications": { title: "Notifications", desc: "Manage alerts and updates" },
};

const notifications = [
  {
    id: 1,
    title: "New order received",
    desc: "#ORD-1042 — AED 520",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Low stock alert",
    desc: "SS Ton Ranger — 2 left",
    time: "18m ago",
    unread: true,
  },
];

export default function AdminHeader({ session }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [whatsappPendingCount, setWhatsappPendingCount] = useState(0);

  const meta = pageMeta[pathname] ?? {
    title: "Admin",
    desc: "iSports Control Panel",
  };
  const unreadCount = notifications.filter((n) => n.unread).length;
  
  const totalNotificationCount = unreadCount + pendingCount;

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch("/api/orders?status=PENDING&limit=100");
        if (!res.ok) throw new Error("Failed to fetch pending orders");
        const data = await res.json();
        setPendingCount(data.total ?? 0);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
      }
    };

    fetchPendingOrders();
    
    // Poll every 60 seconds for new orders
    const interval = setInterval(fetchPendingOrders, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch WhatsApp pending orders count
  useEffect(() => {
    const fetchWhatsappPending = async () => {
      try {
        const res = await fetch("/api/whatsapp/orders?status=WAITING_CONFIRMATION&limit=1");
        const data = await res.json();
        setWhatsappPendingCount(data.pendingCount || 0);
      } catch (e) {
        console.error("Error fetching WhatsApp pending:", e);
      }
    };
    fetchWhatsappPending();
    const interval = setInterval(fetchWhatsappPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  const handleNotificationClick = (notificationId: number) => {
    if (notificationId === 1) {
      router.push("/admin/orders");
    } else if (notificationId === 2) {
      router.push("/admin/products");
    }
    setNotifOpen(false);
  };

  const handleViewAllNotifications = () => {
    router.push("/admin/notifications");
    setNotifOpen(false);
  };

  return (
    <header className="h-[64px] bg-white/70 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 relative z-30 sticky top-0 w-full">
      {/* Left: Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[16px] font-semibold text-gray-900 tracking-tight">
            {meta.title}
          </h1>
          <p className="text-[12px] text-gray-500 font-medium tracking-wide">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Modern Search */}
        <div className="relative hidden md:flex items-center group">
          <Search
            size={14}
            className="absolute left-3 text-gray-400 group-focus-within:text-blue-600 transition-colors"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className="w-[240px] bg-gray-100/50 hover:bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 rounded-lg pl-9 pr-12 py-2 text-[13px] text-gray-800 placeholder-gray-400 transition-all outline-none"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white shadow-sm pointer-events-none">
            <Command size={10} /> K
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* WhatsApp Orders Bell */}
        <Link
          href="/admin/whatsapp-orders"
          className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          title="WhatsApp Orders"
        >
          <MessageCircle size={18} strokeWidth={1.75} />
          {whatsappPendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#25D366] text-white text-[10px] font-black flex items-center justify-center px-1 shadow-md">
              {whatsappPendingCount > 99 ? "99+" : whatsappPendingCount}
            </span>
          )}
        </Link>

        <div className="w-px h-6 bg-gray-200" />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} strokeWidth={1.75} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute right-0 top-full mt-3 w-[340px] bg-white rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-20"
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="text-[13px] font-semibold text-gray-900">
                      Notifications
                    </span>
                    <button 
                      onClick={handleViewAllNotifications}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto">
                    {/* Pending Orders Section */}
                    {pendingCount > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-orange-50/50">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={12} className="text-orange-600" />
                            <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider">
                              Pending Orders
                            </span>
                          </div>
                        </div>
                        <div 
                          onClick={() => handleNotificationClick(1)}
                          className="p-4 hover:bg-gray-50/80 cursor-pointer border-b border-gray-50 last:border-0 flex gap-3 transition-colors"
                        >
                          <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0 bg-orange-500" />
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-gray-900">
                              {pendingCount} Pending Order{pendingCount !== 1 ? 's' : ''}
                            </p>
                            <p className="text-[12px] text-gray-500 mt-0.5">
                              {pendingCount} order{pendingCount !== 1 ? 's' : ''} awaiting processing
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Needs attention
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Regular Notifications */}
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className="p-4 hover:bg-gray-50/80 cursor-pointer border-b border-gray-50 last:border-0 flex gap-3 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.unread ? "bg-blue-500" : "bg-gray-300"}`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-[13px] ${n.unread ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}
                          >
                            {n.title}
                          </p>
                          <p className="text-[12px] text-gray-500 mt-0.5">
                            {n.desc}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))}

                    {notifications.length === 0 && pendingCount === 0 && (
                      <div className="p-8 text-center">
                        <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-[13px] text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[12px] font-medium shadow-sm">
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute right-0 top-full mt-3 w-[260px] bg-white rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-1 z-20"
                >
                  <div className="px-3 py-3 mb-1 border-b border-gray-100">
                    <p className="text-[14px] font-semibold text-gray-900">
                      {session?.user?.name ?? "Administrator"}
                    </p>
                    <p className="text-[12px] text-gray-500 truncate mt-0.5">
                      {session?.user?.email ?? "admin@isportscricket.com"}
                    </p>
                    {session?.user?.role && (
                      <span className="inline-block mt-2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {session.user.role}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <button 
                      onClick={() => {
                        router.push("/admin/profile");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} /> My Profile
                    </button>
                    <button 
                      onClick={() => {
                        router.push("/admin/settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}