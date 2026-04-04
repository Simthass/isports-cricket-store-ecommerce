// src/components/admin/AdminHeader.tsx
"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

// Define the session user type
interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface AdminHeaderProps {
  session: {
    user?: SessionUser;
  } | null;
}

const pageMeta: Record<string, { title: string; desc: string }> = {
  "/admin/dashboard": {
    title: "Dashboard",
    desc: "Overview of your store performance",
  },
  "/admin/products": { title: "Products", desc: "Manage your product catalog" },
  "/admin/orders": {
    title: "Orders",
    desc: "Track and manage customer orders",
  },
  "/admin/customers": {
    title: "Customers",
    desc: "View and manage your customers",
  },
  "/admin/categories": {
    title: "Categories",
    desc: "Organize your product categories",
  },
  "/admin/brands": { title: "Brands", desc: "Manage cricket brands" },
  "/admin/whatsapp": {
    title: "WhatsApp",
    desc: "Automation templates & settings",
  },
  "/admin/analytics": {
    title: "Analytics",
    desc: "Sales reports and insights",
  },
  "/admin/settings": { title: "Settings", desc: "Configure your store" },
};

const notifications = [
  {
    id: 1,
    title: "New order received",
    desc: "#ORD-1042 — AED 520",
    time: "2m ago",
    unread: true,
    color: "#81bf42",
  },
  {
    id: 2,
    title: "Low stock alert",
    desc: "SS Ton Ranger — 2 left",
    time: "18m ago",
    unread: true,
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "New customer registered",
    desc: "Ahmed Al Rashid joined",
    time: "1h ago",
    unread: false,
    color: "#004b9c",
  },
];

export default function AdminHeader({ session }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const meta = pageMeta[pathname] ?? {
    title: "Admin",
    desc: "iSports Cricket",
  };
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  return (
    <header className="h-[60px] bg-white border-b border-gray-100/80 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 relative z-30">
      {/* Left: Breadcrumb & Title */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-bold text-gray-900 leading-tight tracking-tight">
              {meta.title}
            </h1>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="hidden sm:block text-[11px] text-gray-400 font-medium">
              {meta.desc}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search section - same as before */}
        <div className="relative hidden md:flex items-center">
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center overflow-hidden"
              >
                <div className="relative w-full">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    autoFocus
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/8 transition-all"
                  />
                  {searchValue && (
                    <button
                      onClick={() => setSearchValue("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <Search size={15} />
              </motion.button>
            )}
          </AnimatePresence>
          {searchOpen && (
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
              className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all flex-shrink-0"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-100 mx-1" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <Bell size={16} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-[1.5px] border-white"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-[300px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <p className="text-[13px] font-bold text-gray-900">
                      Notifications
                    </p>
                    <span className="text-[10px] font-bold text-[#004b9c] bg-[#e8f0fb] px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? "bg-blue-50/30" : ""}`}
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: n.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {n.desc}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-300 whitespace-nowrap flex-shrink-0 mt-0.5">
                          {n.time}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-50">
                    <button className="w-full text-center text-[11px] font-semibold text-[#004b9c] hover:underline">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-100 mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              {session?.user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[11.5px] font-bold text-gray-800 leading-tight">
                {session?.user?.name ?? "Admin"}
              </p>
              <p className="text-[9.5px] text-gray-400 leading-tight">
                Administrator
              </p>
            </div>
            <ChevronDown
              size={12}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Profile dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20"
                >
                  {/* Profile info */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-[12px] font-bold text-gray-900">
                      {session?.user?.name ?? "Admin"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {session?.user?.email ?? "admin@isportscricket.com"}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-[#81bf42] bg-[#eef7e0] px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-[#81bf42]" />
                      Administrator
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5 px-1.5">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left">
                      <User size={13} className="text-gray-400" />
                      My Profile
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left">
                      <Settings size={13} className="text-gray-400" />
                      Settings
                    </button>
                  </div>

                  <div className="p-1.5 border-t border-gray-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={13} />
                      Sign Out
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
