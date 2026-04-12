"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  DollarSign,
  Loader2,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ── Types ─────────────────────────────────────────────────────
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  orderSource: string;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  brandId?: { name: string };
  categoryId?: { name: string };
  stockQty: number;
  slug: string;
}

interface TopBrand {
  _id: string;
  name: string;
  sales: number;
  revenue: number;
  logo?: string;
}

// ── Status Config ─────────────────────────────────────────────
const statusMap: Record<
  string,
  { color: string; bg: string; icon: React.ElementType; label: string }
> = {
  PENDING: { color: "#d97706", bg: "#fffbeb", icon: Clock, label: "Pending" },
  CONFIRMED: {
    color: "#2563eb",
    bg: "#eff6ff",
    icon: CheckCircle2,
    label: "Confirmed",
  },
  PROCESSING: {
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: Clock,
    label: "Processing",
  },
  SHIPPED: { color: "#059669", bg: "#ecfdf5", icon: Package, label: "Shipped" },
  DELIVERED: {
    color: "#16a34a",
    bg: "#f0fdf4",
    icon: CheckCircle2,
    label: "Delivered",
  },
  CANCELLED: {
    color: "#dc2626",
    bg: "#fef2f2",
    icon: AlertCircle,
    label: "Cancelled",
  },
  PAID: { color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2, label: "Paid" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? statusMap.PENDING;
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
      {s.label}
    </span>
  );
}

// ── Stats Card Component ──────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  color,
  lightColor,
  change,
  subtext,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
  change?: { value: number; isPositive: boolean };
  subtext?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 group relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-[0.06] pointer-events-none"
        style={{ background: color, transform: "translate(30%, -30%)" }}
      />
      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: lightColor }}
        >
          {icon}
        </div>
        {change && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg ${
              change.isPositive
                ? "text-green-600 bg-green-50"
                : "text-red-500 bg-red-50"
            }`}
          >
            {change.isPositive ? (
              <ArrowUpRight size={11} />
            ) : (
              <ArrowDownRight size={11} />
            )}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <p className="text-[24px] font-black text-gray-900 leading-none tracking-tight mb-1 relative">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[12px] font-medium text-gray-500">{title}</p>
      {subtext && <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>}
    </motion.div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────
export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStock(data.lowStock || []);
        setTopBrands(data.topBrands || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: stats ? `AED ${stats.totalRevenue.toLocaleString()}` : "AED 0",
      icon: (
        <DollarSign size={18} strokeWidth={2} style={{ color: "#004b9c" }} />
      ),
      color: "#004b9c",
      lightColor: "#e8f0fb",
      change: stats
        ? { value: stats.revenueChange, isPositive: stats.revenueChange >= 0 }
        : undefined,
      subtext: "vs last month",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: (
        <ClipboardList size={18} strokeWidth={2} style={{ color: "#81bf42" }} />
      ),
      color: "#81bf42",
      lightColor: "#eef7e0",
      change: stats
        ? { value: stats.ordersChange, isPositive: stats.ordersChange >= 0 }
        : undefined,
      subtext: "vs last month",
    },
    {
      title: "Products",
      value: stats?.totalProducts || 0,
      icon: (
        <ShoppingBag size={18} strokeWidth={2} style={{ color: "#f59e0b" }} />
      ),
      color: "#f59e0b",
      lightColor: "#fef3c7",
      change: stats
        ? { value: stats.productsChange, isPositive: stats.productsChange >= 0 }
        : undefined,
      subtext: "this week",
    },
    {
      title: "Customers",
      value: stats?.totalCustomers || 0,
      icon: <Users size={18} strokeWidth={2} style={{ color: "#8b5cf6" }} />,
      color: "#8b5cf6",
      lightColor: "#ede9fe",
      change: stats
        ? {
            value: stats.customersChange,
            isPositive: stats.customersChange >= 0,
          }
        : undefined,
      subtext: "this month",
    },
  ];

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
            {session?.user?.name ?? "Admin"} - iSports Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
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
        {statsCards.map((stat, i) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* ── Orders + Brands ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Orders Table */}
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
                Latest orders from all channels
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
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ClipboardList
                  size={32}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="text-[13px]">No orders yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50/80">
                    {[
                      "Order",
                      "Customer",
                      "Amount",
                      "Channel",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-left text-[10px] font-bold text-gray-400 tracking-[0.1em] uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="border-b border-gray-50/60 hover:bg-gray-50/40 transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <p className="text-[11.5px] font-bold text-[#004b9c]">
                          {order.orderNumber}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-AE",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
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
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[11.5px] font-medium text-gray-700 whitespace-nowrap">
                            {order.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[12px] font-bold text-gray-900">
                          AED {order.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`flex items-center gap-1 text-[10.5px] font-semibold ${
                            order.orderSource === "whatsapp"
                              ? "text-green-600"
                              : "text-blue-500"
                          }`}
                        >
                          {order.orderSource === "whatsapp" ? (
                            <MessageCircle size={10} />
                          ) : (
                            <Eye size={10} />
                          )}
                          {order.orderSource === "whatsapp"
                            ? "WhatsApp"
                            : "Web"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders`}>
                          <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                            <Eye size={12} />
                          </button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
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
          {topBrands.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <Package size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-[12px]">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topBrands.map((brand, i) => {
                const maxSales = Math.max(...topBrands.map((b) => b.sales), 1);
                const percentage = (brand.sales / maxSales) * 100;
                const colors = ["#004b9c", "#81bf42", "#f59e0b", "#8b5cf6"];
                const color = colors[i % colors.length];

                return (
                  <motion.div
                    key={brand._id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
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
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          delay: 0.55 + i * 0.08,
                          duration: 0.7,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${color}cc, ${color})`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      AED {brand.revenue.toLocaleString()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Low Stock + Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Low Stock Alert */}
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
                  Products needing restock
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
          {lowStock.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-green-300" />
              <p className="text-[13px]">All products are well stocked!</p>
            </div>
          ) : (
            <div>
              {lowStock.map((item, i) => (
                <motion.div
                  key={item._id}
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
                        {item.brandId?.name || "Unknown Brand"} ·{" "}
                        {item.categoryId?.name || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        item.stockQty <= 2
                          ? "text-red-600 bg-red-50 border-red-100"
                          : "text-amber-600 bg-amber-50 border-amber-100"
                      }`}
                    >
                      {item.stockQty} left
                    </span>
                    <Link href={`/admin/products/${item.slug}`}>
                      <button className="text-[11px] font-semibold text-[#004b9c] hover:underline whitespace-nowrap">
                        Restock →
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
