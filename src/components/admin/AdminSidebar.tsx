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
  Store,
} from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Store",
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
    label: "Catalog",
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
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-full flex-shrink-0 z-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a1120 0%, #0d1628 60%, #0a1120 100%)",
      }}
    >
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#004b9c] to-[#81bf42] flex-shrink-0" />

      {/* Logo area */}
      <div className="flex items-center h-[60px] px-3.5 border-b border-white/[0.05] flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="relative w-[118px] h-[38px] flex-shrink-0">
                <Image
                  src="/ISportsCricket-Logo.png"
                  alt="iSports"
                  fill
                  sizes="118px"
                  className="object-contain object-left brightness-0 invert opacity-90"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              <span className="text-[#81bf42] text-[11px] font-black tracking-tight">
                iS
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9.5px] font-bold text-white/20 tracking-[0.2em] uppercase px-3 mb-1.5"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                        isActive
                          ? "text-white"
                          : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                      }`}
                      style={
                        isActive
                          ? {
                              background: "rgba(0,75,156,0.5)",
                              boxShadow: "inset 0 0 0 1px rgba(0,75,156,0.4)",
                            }
                          : {}
                      }
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActive"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#81bf42]"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      <Icon
                        size={16}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className="flex-shrink-0"
                      />

                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex items-center justify-between flex-1 overflow-hidden"
                          >
                            <span className="text-[12.5px] font-medium whitespace-nowrap">
                              {item.label}
                            </span>
                            {"badge" in item && item.badge && (
                              <span className="bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a2540] text-white text-[12px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10 transition-opacity duration-150">
                          {item.label}
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1a2540] border-l border-b border-white/10 rotate-45" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/[0.05] flex-shrink-0" />

      {/* View Store link */}
      <div className="px-2 py-2 flex-shrink-0">
        <Link href="/" target="_blank">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer group">
            <Store size={16} strokeWidth={1.8} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-[12.5px] font-medium whitespace-nowrap">
                View Store
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Logout */}
      <div className="px-2 pb-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={16} strokeWidth={1.8} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-[12.5px] font-medium whitespace-nowrap">
              Sign Out
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all z-30 shadow-lg border border-white/10"
        style={{ background: "#1a2540" }}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </motion.aside>
  );
}
