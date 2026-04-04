// src/components/admin/AdminSidebar.tsx
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
        badge: "12",
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
      className="relative flex flex-col h-screen flex-shrink-0 z-40 bg-[#09090b] border-r border-white/[0.08] select-none"
    >
      {/* Brand Header */}
      <div className="h-[64px] flex items-center px-5 border-b border-white/[0.05]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 w-full"
            >
              {/* Image Container for Expanded State */}
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/ISportsCricket-Logo.png"
                  alt="iSports Logo"
                  fill
                  className="object-contain" // Remove "brightness-0 invert" if logo is already light
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white tracking-tight leading-none">
                  iSports
                </span>
                <span className="text-[11px] font-medium text-blue-500 tracking-wide mt-0.5">
                  Cricket Admin Panel
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
              {/* Image Container for Collapsed State */}
              <div className="relative w-9 h-9">
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
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] px-2"
              >
                {group.label}
              </motion.p>
            )}

            <div className="space-y-1">
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
                    className="block relative group"
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2 : 1.5}
                        className={`flex-shrink-0 transition-colors ${isActive ? "text-blue-400" : "group-hover:text-zinc-100"}`}
                      />

                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[13.5px] font-medium whitespace-nowrap flex-1"
                        >
                          {item.label}
                        </motion.span>
                      )}

                      {/* Active Pill Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute left-[-16px] w-[3px] h-5 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                        />
                      )}

                      {/* Badge */}
                      {!collapsed && item.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Tooltip for Collapsed State */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-8px] group-hover:translate-x-0 whitespace-nowrap z-50 border border-white/10 shadow-2xl">
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
      <div className="p-4 border-t border-white/[0.05] space-y-1">
        <Link href="/" target="_blank">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] transition-all cursor-pointer">
            <ExternalLink
              size={18}
              strokeWidth={1.5}
              className="flex-shrink-0"
            />
            {!collapsed && (
              <span className="text-[13px] font-medium whitespace-nowrap">
                View Storefront
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={18} strokeWidth={1.5} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-[13px] font-medium whitespace-nowrap">
              Sign Out
            </span>
          )}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-16 w-7 h-7 rounded-full bg-[#09090b] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all z-50 shadow-xl"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
