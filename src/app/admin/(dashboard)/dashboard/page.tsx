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
} from "lucide-react";
import Link from "next/link";

// ── Stat Cards Data ──────────────────────────────────────────
const stats = [
  {
    label: "Total Revenue",
    value: "AED 84,320",
    change: "+12.5%",
    up: true,
    icon: TrendingUp,
    color: "#004b9c",
    lightColor: "#e8f0fb",
    sub: "vs last month",
  },
  {
    label: "Total Orders",
    value: "342",
    change: "+8.2%",
    up: true,
    icon: ClipboardList,
    color: "#81bf42",
    lightColor: "#eef7e0",
    sub: "vs last month",
  },
  {
    label: "Total Products",
    value: "186",
    change: "+4",
    up: true,
    icon: ShoppingBag,
    color: "#f59e0b",
    lightColor: "#fef3c7",
    sub: "new this week",
  },
  {
    label: "Total Customers",
    value: "1,248",
    change: "+22",
    up: true,
    icon: Users,
    color: "#8b5cf6",
    lightColor: "#ede9fe",
    sub: "new this month",
  },
];

// ── Recent Orders ────────────────────────────────────────────
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

// ── Low Stock Products ───────────────────────────────────────
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

// ── Top Brands ───────────────────────────────────────────────
const topBrands = [
  { name: "SS", sales: 84, revenue: "AED 28,400", color: "#004b9c" },
  { name: "Gray-Nicolls", sales: 62, revenue: "AED 55,700", color: "#81bf42" },
  { name: "Kookaburra", sales: 47, revenue: "AED 22,000", color: "#f59e0b" },
  { name: "MRF", sales: 38, revenue: "AED 47,500", color: "#8b5cf6" },
];

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { color: string; bg: string; icon: React.ElementType }
  > = {
    Delivered: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
    Processing: { color: "#2563eb", bg: "#dbeafe", icon: Clock },
    Pending: { color: "#d97706", bg: "#fef3c7", icon: AlertCircle },
    Cancelled: { color: "#dc2626", bg: "#fee2e2", icon: AlertCircle },
  };
  const s = map[status] ?? map.Pending;
  const Icon = s.icon;

  return (
    <span
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <Icon size={10} />
      {status}
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: stat.lightColor }}
        >
          <Icon size={20} style={{ color: stat.color }} strokeWidth={2} />
        </div>
        <span
          className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full ${
            stat.up ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
          }`}
        >
          {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {stat.change}
        </span>
      </div>
      <p className="text-[26px] font-black text-gray-900 leading-none mb-1 tracking-tight">
        {stat.value}
      </p>
      <p className="text-[13px] font-medium text-gray-500">{stat.label}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
    </motion.div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Welcome Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2
            className="text-[26px] font-black text-gray-900 tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Good Morning, Admin 👋
          </h2>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Here's what's happening at iSports Cricket today.
          </p>
        </div>
        <Link href="/admin/products/new">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_16px_rgba(0,75,156,0.3)] transition-all"
          >
            <Plus size={15} />
            Add Product
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* ── Middle Row: Orders Table + Top Brands ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">
                Recent Orders
              </h3>
              <p className="text-[11px] text-gray-400">
                Last 5 orders across all channels
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-[12px] font-semibold text-[#004b9c] hover:underline flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {[
                    "Order",
                    "Customer",
                    "Product",
                    "Amount",
                    "Source",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 tracking-wider uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-bold text-[#004b9c]">
                        {order.id}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {order.time}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#004b9c] to-[#81bf42] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">
                            {order.customer.charAt(0)}
                          </span>
                        </div>
                        <span className="text-[12px] font-medium text-gray-700 whitespace-nowrap">
                          {order.customer}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-gray-600 whitespace-nowrap">
                        {order.product}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-bold text-gray-900">
                        {order.amount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                          order.source === "WhatsApp"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.source === "WhatsApp" ? (
                          <MessageCircle size={11} />
                        ) : (
                          <Eye size={11} />
                        )}
                        {order.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                        <MoreHorizontal size={14} />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <div className="mb-5">
            <h3 className="text-[15px] font-bold text-gray-900">Top Brands</h3>
            <p className="text-[11px] text-gray-400">By sales volume</p>
          </div>

          <div className="space-y-4">
            {topBrands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: brand.color }}
                    />
                    <span className="text-[13px] font-semibold text-gray-700">
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">
                    {brand.sales} sales
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(brand.sales / 84) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: brand.color }}
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

      {/* ── Bottom Row: Low Stock + Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle size={14} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Low Stock Alert
                </h3>
                <p className="text-[11px] text-gray-400">
                  Products running low
                </p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="text-[12px] font-semibold text-[#004b9c] hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {lowStock.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Package size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {item.brand} · {item.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                      item.stock <= 2
                        ? "text-red-600 bg-red-50"
                        : "text-amber-600 bg-amber-50"
                    }`}
                  >
                    {item.stock} left
                  </span>
                  <button className="text-[12px] font-semibold text-[#004b9c] hover:underline">
                    Restock
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">
            Quick Actions
          </h3>

          <div className="space-y-2.5">
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
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.06 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: action.bg }}
                    >
                      <Icon size={15} style={{ color: action.color }} />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      {action.label}
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors"
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
