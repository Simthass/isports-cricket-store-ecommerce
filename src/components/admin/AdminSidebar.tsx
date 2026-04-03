"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
    badge: null,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    badge: "12",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Layers,
  },
  {
    label: "Brands",
    href: "/admin/brands",
    icon: Tag,
  },
  {
    label: "WhatsApp",
    href: "/admin/whatsapp",
    icon: MessageCircle,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col bg-[#0d1628] h-full flex-shrink-0 overflow-hidden z-20"
    >
      {/* Top brand strip */}
      <div className="h-1 bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c] flex-shrink-0" />

      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-[130px] h-[42px] flex-shrink-0"
            >
              <Image
                src="/ISportsCricket-Logo.png"
                alt="iSports"
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-lg bg-[#004b9c] flex items-center justify-center flex-shrink-0"
            >
              <span className="text-[#81bf42] text-[11px] font-black">iS</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                transition={{ duration: 0.15 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                  active
                    ? "bg-[#004b9c] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#81bf42] rounded-full"
                  />
                )}

                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  className="flex-shrink-0"
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[12px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-150">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Logout */}
      <div className="px-2 py-4 border-t border-white/5 flex-shrink-0">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full group">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-[13px] font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1e2d47] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#004b9c] transition-all z-30 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
