"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Users,
  Tag,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageCircle,
  BarChart3,
  ExternalLink,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Products", href: "/admin/products", icon: ShoppingBag },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ClipboardList,
      },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Categories", href: "/admin/categories", icon: Layers },
      { label: "Brands", href: "/admin/brands", icon: Tag },
    ],
  },
  {
    label: "System",
    items: [
      { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen flex-shrink-0 z-40 bg-gradient-to-b from-[#0A1325] to-[#050A14] border-r border-blue-900/30 select-none shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
    >
      {/* Brand Header */}
      <div className="h-[72px] flex items-center px-5 border-b border-blue-900/30 relative z-20">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 w-full"
            >
              <div className="relative w-9 h-9 flex-shrink-0 drop-shadow-md">
                <Image
                  src="/ISportsCricket-Logo.png"
                  alt="iSports Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-extrabold text-white tracking-tight leading-none drop-shadow-sm">
                  iSports
                </span>
                <span className="text-[11px] font-semibold text-blue-400 tracking-wide mt-1 uppercase">
                  Cricket Admin
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mini-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full flex justify-center"
            >
              <div className="relative w-10 h-10 drop-shadow-md">
                <Image
                  src="/ISportsCricket-Logo.png"
                  alt="iSports Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide relative z-10">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-bold text-blue-200/50 uppercase tracking-[0.2em] px-3 mb-3"
              >
                {group.label}
              </motion.p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block relative group outline-none"
                  >
                    {/* Animated Sliding Background for Active State */}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-bg"
                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-blue-500/50"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <div
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 z-10 ${
                        isActive
                          ? "text-white"
                          : "text-blue-100/60 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`flex-shrink-0 transition-transform duration-300 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />

                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-[13.5px] font-semibold whitespace-nowrap flex-1 tracking-wide ${
                            isActive ? "drop-shadow-sm" : ""
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </div>

                    {/* Tooltip for Collapsed State */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-[#0F1C35] text-white text-[13px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 border border-blue-500/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-center gap-2">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-blue-900/30 space-y-1.5 relative z-20 bg-[#050A14]/50 backdrop-blur-md">
        <Link href="/" target="_blank">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer group">
            <ExternalLink
              size={18}
              strokeWidth={2}
              className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
            />
            {!collapsed && (
              <span className="text-[13.5px] font-semibold whitespace-nowrap tracking-wide">
                View Storefront
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200/60 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut
            size={18}
            strokeWidth={2}
            className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:text-red-400"
          />
          {!collapsed && (
            <span className="text-[13.5px] font-semibold whitespace-nowrap tracking-wide">
              Sign Out
            </span>
          )}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-16 w-7 h-7 rounded-full bg-blue-600 border-2 border-[#0A1325] flex items-center justify-center text-white hover:bg-blue-500 hover:scale-110 transition-all z-50 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
      >
        {collapsed ? (
          <ChevronRight size={16} strokeWidth={3} />
        ) : (
          <ChevronLeft size={16} strokeWidth={3} />
        )}
      </button>
    </motion.aside>
  );
}