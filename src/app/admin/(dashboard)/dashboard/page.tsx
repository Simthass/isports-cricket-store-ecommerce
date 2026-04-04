"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ClipboardList,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Eye,
  MoreHorizontal,
  Plus,
  Settings,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const stats = [
  {
    label: "Total Revenue",
    value: "AED 84,320",
    change: "+12.5%",
    up: true,
    icon: TrendingUp,
    color: "#004b9c",
    light: "#e8f0fb",
    sub: "vs last month",
  },
  {
    label: "Total Orders",
    value: "342",
    change: "+8.2%",
    up: true,
    icon: ClipboardList,
    color: "#81bf42",
    light: "#eef7e0",
    sub: "vs last month",
  },
  {
    label: "Products",
    value: "186",
    change: "+4 new",
    up: true,
    icon: ShoppingBag,
    color: "#f59e0b",
    light: "#fef3c7",
    sub: "this week",
  },
  {
    label: "Customers",
    value: "1,248",
    change: "+22",
    up: true,
    icon: Users,
    color: "#8b5cf6",
    light: "#ede9fe",
    sub: "this month",
  },
];

const recentOrders = [
  {
    id: "#ORD-1041",
    customer: "Ahmed Al Rashid",
    product: "SS Ton Ranger Bat",
    amount: "AED 349",
    status: "Delivered",
    source: "WhatsApp",
    time: "2 hrs ago",
  },
  {
    id: "#ORD-1040",
    customer: "Vikram Nair",
    product: "Kookaburra Pro Helmet",
    amount: "AED 520",
    status: "Processing",
    source: "Web",
    time: "4 hrs ago",
  },
  {
    id: "#ORD-1039",
    customer: "Mohammed Farhan",
    product: "Gray-Nicolls Bat",
    amount: "AED 899",
    status: "Pending",
    source: "WhatsApp",
    time: "6 hrs ago",
  },
  {
    id: "#ORD-1038",
    customer: "Rajan Patel",
    product: "MRF Genius Grand",
    amount: "AED 1,250",
    status: "Delivered",
    source: "Web",
    time: "1 day ago",
  },
  {
    id: "#ORD-1037",
    customer: "Sanjay Kumar",
    product: "Shrey Master Helmet",
    amount: "AED 610",
    status: "Cancelled",
    source: "WhatsApp",
    time: "1 day ago",
  },
];

const lowStock = [
  { name: "SS Ton Ranger Bat", brand: "SS", stock: 2, category: "Bats" },
  {
    name: "Shrey Master Helmet",
    brand: "Shrey",
    stock: 1,
    category: "Helmets",
  },
  { name: "MRF Genius Grand", brand: "MRF", stock: 3, category: "Bats" },
  { name: "SG Test Cricket Ball", brand: "SG", stock: 5, category: "Balls" },
];

const topBrands = [
  { name: "SS", sales: 84, revenue: "AED 28,400", color: "#004b9c" },
  { name: "Gray-Nicolls", sales: 62, revenue: "AED 55,700", color: "#81bf42" },
  { name: "Kookaburra", sales: 47, revenue: "AED 22,000", color: "#f59e0b" },
  { name: "MRF", sales: 38, revenue: "AED 47,500", color: "#8b5cf6" },
];

const statusMap: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Delivered: { color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  Processing: { color: "#2563eb", bg: "#eff6ff", icon: Clock },
  Pending: { color: "#d97706", bg: "#fffbeb", icon: Clock },
  Cancelled: { color: "#dc2626", bg: "#fef2f2", icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? statusMap.Pending;
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
      style={{
        color: s.color,
        backgroundColor: s.bg,
        borderColor: `${s.color}20`,
      }}
    >
      <Icon size={9} strokeWidth={2.5} />
      {status}
    </span>
  );
}

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 group relative overflow-hidden"
    >
      {/* Subtle bg accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-[0.06] pointer-events-none"
        style={{ background: stat.color, transform: "translate(30%, -30%)" }}
      />
      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: stat.light }}
        >
          <Icon size={18} strokeWidth={2} style={{ color: stat.color }} />
        </div>
        <span
          className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg ${stat.up ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}
        >
          {stat.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {stat.change}
        </span>
      </div>
      <p className="text-[24px] font-black text-gray-900 leading-none tracking-tight mb-1 relative">
        {stat.value}
      </p>
      <p className="text-[12px] font-medium text-gray-500">{stat.label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-5 max-w-[1380px]">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <p className="text-[11px] font-semibold text-[#81bf42] tracking-[0.15em] uppercase mb-1">
            {greeting}
          </p>
          <h2
            className="text-[22px] font-black text-gray-900 tracking-tight leading-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {session?.user?.name ?? "Admin"} — iSports Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 text-white text-[12px] font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,75,156,0.25)]"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              <Plus size={14} />
              Add Product
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {stats.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      {/* ── Orders + Brands ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Orders table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-[13.5px] font-bold text-gray-900">
                Recent Orders
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Latest 5 across all channels
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-[11.5px] font-semibold text-[#004b9c] hover:gap-2 transition-all"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50/80">
                  {["Order", "Customer", "Amount", "Channel", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-left text-[10px] font-bold text-gray-400 tracking-[0.1em] uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="border-b border-gray-50/60 hover:bg-gray-50/40 transition-colors group"
                  >
                    <td className="px-5 py-3">
                      <p className="text-[11.5px] font-bold text-[#004b9c]">
                        {order.id}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {order.time}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #004b9c, #81bf42)",
                          }}
                        >
                          {order.customer.charAt(0)}
                        </div>
                        <span className="text-[11.5px] font-medium text-gray-700 whitespace-nowrap">
                          {order.customer}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] font-bold text-gray-900">
                        {order.amount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`flex items-center gap-1 text-[10.5px] font-semibold ${order.source === "WhatsApp" ? "text-green-600" : "text-blue-500"}`}
                      >
                        {order.source === "WhatsApp" ? (
                          <MessageCircle size={10} />
                        ) : (
                          <Eye size={10} />
                        )}
                        {order.source}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3">
                      <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                        <MoreHorizontal size={12} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Brands */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[13.5px] font-bold text-gray-900">
                Top Brands
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                By sales volume
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {topBrands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: brand.color }}
                    />
                    <span className="text-[12.5px] font-semibold text-gray-800">
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-bold text-gray-400">
                    {brand.sales} units
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(brand.sales / 84) * 100}%` }}
                    transition={{
                      delay: 0.55 + i * 0.08,
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${brand.color}cc, ${brand.color})`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {brand.revenue}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Low Stock + Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Low Stock */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertCircle size={13} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-gray-900">
                  Low Stock Alert
                </h3>
                <p className="text-[11px] text-gray-400">
                  Needs immediate attention
                </p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-[11.5px] font-semibold text-[#004b9c] hover:gap-2 transition-all"
            >
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          <div>
            {lowStock.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors border-b border-gray-50/60 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={13} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-[10.5px] text-gray-400">
                      {item.brand} · {item.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${item.stock <= 2 ? "text-red-600 bg-red-50 border-red-100" : "text-amber-600 bg-amber-50 border-amber-100"}`}
                  >
                    {item.stock} left
                  </span>
                  <button className="text-[11px] font-semibold text-[#004b9c] hover:underline whitespace-nowrap">
                    Restock →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <h3 className="text-[13.5px] font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-1.5">
            {[
              {
                label: "Add New Product",
                href: "/admin/products/new",
                color: "#004b9c",
                bg: "#e8f0fb",
                icon: ShoppingBag,
              },
              {
                label: "View All Orders",
                href: "/admin/orders",
                color: "#81bf42",
                bg: "#eef7e0",
                icon: ClipboardList,
              },
              {
                label: "Manage Customers",
                href: "/admin/customers",
                color: "#f59e0b",
                bg: "#fef3c7",
                icon: Users,
              },
              {
                label: "WhatsApp Templates",
                href: "/admin/whatsapp",
                color: "#25d366",
                bg: "#dcfce7",
                icon: MessageCircle,
              },
              {
                label: "Store Settings",
                href: "/admin/settings",
                color: "#8b5cf6",
                bg: "#ede9fe",
                icon: Settings,
              },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: action.bg }}
                    >
                      <Icon size={13} style={{ color: action.color }} />
                    </div>
                    <span className="text-[12.5px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors flex-1">
                      {action.label}
                    </span>
                    <ArrowRight
                      size={11}
                      className="text-gray-300 group-hover:text-gray-500 transition-colors"
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
