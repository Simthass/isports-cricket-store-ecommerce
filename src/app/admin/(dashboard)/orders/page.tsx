"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  ChevronDown,
  Eye,
  Check,
  Truck,
  X,
  Loader2,
  RefreshCw,
  Filter,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck as TruckIcon,
  FileText,
  User,
  ShoppingBag,
  Clock,
  TrendingUp,
  DollarSign,
  Box,
  Users,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  List,
  AlertCircle,
  Send,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface OrderItem {
  productId?: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  emirate?: string;
  paymentMethod: string;
  paymentIntentId?: string;
  deliveryMethod?: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
  userId?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: React.createElement(Clock, { size: 12 }),
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: React.createElement(CheckCircle2, { size: 12 }),
  },
  PROCESSING: {
    label: "Processing",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: React.createElement(Loader2, { size: 12 }),
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: React.createElement(Truck, { size: 12 }),
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: React.createElement(Check, { size: 12 }),
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: React.createElement(X, { size: 12 }),
  },
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${color} opacity-10`}
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
          >
            {icon}
          </div>
          {trend && (
            <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-[28px] font-black text-gray-900 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// Toast Component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-2xl flex items-center gap-2.5"
    >
      {type === "success" ? (
        <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={13} className="text-green-400" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
          <AlertCircle size={13} className="text-red-400" />
        </div>
      )}
      {message}
    </motion.div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const totalPages = Math.ceil(total / 20);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus } : prev,
          );
        }
        showToast(`Order status updated to ${newStatus}`, "success");
      }
    } catch (error) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  const counts = ALL_STATUSES.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  const stats = {
    total: total,
    pending: counts.PENDING,
    processing: counts.PROCESSING,
    shipped: counts.SHIPPED,
    delivered: counts.DELIVERED,
    totalRevenue: orders.reduce(
      (acc, o) => acc + (o.status !== "CANCELLED" ? o.totalAmount : 0),
      0,
    ),
  };

  const statusFilters = [
    {
      value: "ALL",
      label: "All Orders",
      icon: Package,
      count: stats.total,
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock,
      count: counts.PENDING,
      color: "from-amber-500 to-orange-500",
    },
    {
      value: "CONFIRMED",
      label: "Confirmed",
      icon: CheckCircle2,
      count: counts.CONFIRMED,
      color: "from-blue-500 to-indigo-500",
    },
    {
      value: "PROCESSING",
      label: "Processing",
      icon: Loader2,
      count: counts.PROCESSING,
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "SHIPPED",
      label: "Shipped",
      icon: Truck,
      count: counts.SHIPPED,
      color: "from-indigo-500 to-blue-500",
    },
    {
      value: "DELIVERED",
      label: "Delivered",
      icon: Check,
      count: counts.DELIVERED,
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      icon: X,
      count: counts.CANCELLED,
      color: "from-red-500 to-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="space-y-6 max-w-[1600px] mx-auto p-6">
        {/* Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#004b9c] to-[#0062cc] rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
                <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">
                  Order Management
                </span>
              </div>
              <h1 className="text-[28px] font-black tracking-tight">Orders</h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Manage and track all customer orders
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white text-[13px] font-bold hover:bg-white/20 transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard
            title="Total Orders"
            value={stats.total}
            icon={<Package size={18} className="text-white" />}
            color="from-blue-500 to-cyan-500"
            trend={stats.total > 0 ? "+12% this month" : undefined}
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock size={18} className="text-white" />}
            color="from-amber-500 to-orange-500"
          />
          <StatsCard
            title="Processing"
            value={stats.processing}
            icon={<Loader2 size={18} className="text-white" />}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="Shipped"
            value={stats.shipped}
            icon={<Truck size={18} className="text-white" />}
            color="from-indigo-500 to-blue-500"
          />
          <StatsCard
            title="Revenue"
            value={`AED ${(stats.totalRevenue / 1000).toFixed(0)}K`}
            icon={<DollarSign size={18} className="text-white" />}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order number, customer name, email or phone..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = filterStatus === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setFilterStatus(filter.value as any);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      isActive
                        ? filter.value === "ALL"
                          ? "bg-[#004b9c] text-white shadow-md"
                          : `bg-gradient-to-r ${filter.color} text-white shadow-md`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon
                      size={12}
                      className={
                        filter.value === "PROCESSING" && isActive
                          ? "animate-spin"
                          : ""
                      }
                    />
                    {filter.label}
                    <span
                      className={`text-[10px] ${isActive ? "text-white/80" : "text-gray-400"}`}
                    >
                      ({filter.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <p className="text-[16px] font-bold text-gray-700 mb-1">
                {search ? "No orders match your search" : "No orders found"}
              </p>
              <p className="text-[13px] text-gray-400 mb-5 max-w-sm">
                {search
                  ? "Try a different keyword or clear the search filter"
                  : "Orders will appear here once customers place orders"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-bold"
                >
                  <Filter size={14} /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <th className="w-8 px-3 py-4" />
                      <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Order
                      </th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Customer
                      </th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden md:table-cell">
                        Date
                      </th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden lg:table-cell">
                        Payment
                      </th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Status
                      </th>
                      <th className="text-right px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">
                        Total
                      </th>
                      <th className="px-3 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, idx) => {
                      const cfg = STATUS_CONFIG[order.status];
                      const isUpdating = updatingId === order._id;
                      const isExpanded = expandedOrderId === order._id;
                      return (
                        <React.Fragment key={order._id}>
                          <tr
                            className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}
                          >
                            <td className="px-3 py-4">
                              <button
                                onClick={() => toggleExpand(order._id)}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-[#004b9c]">
                                {order.orderNumber}
                              </p>
                              <p className="text-gray-400 text-[11px]">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-gray-800">
                                {order.customerName}
                              </p>
                              <p className="text-gray-400 text-[11px] flex items-center gap-1">
                                <Phone size={10} /> {order.customerPhone}
                              </p>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <p className="text-gray-500 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-AE",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="text-[11px] font-bold border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 uppercase">
                                {order.paymentMethod === "cod"
                                  ? "Cash on Delivery"
                                  : order.paymentMethod}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {isUpdating ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin text-[#004b9c]"
                                />
                              ) : (
                                <div className="relative group">
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      updateStatus(
                                        order._id,
                                        e.target.value as OrderStatus,
                                      )
                                    }
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border cursor-pointer appearance-none pr-7 focus:outline-none ${cfg.bg} ${cfg.color} ${cfg.border}`}
                                  >
                                    {ALL_STATUSES.map((s) => (
                                      <option key={s} value={s}>
                                        {STATUS_CONFIG[s].label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={10}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${cfg.color}`}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <p className="font-black text-[#004b9c] text-[15px]">
                                AED {order.totalAmount.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-[#004b9c] transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Row */}
                          {isExpanded && (
                            <tr>
                              <td
                                colSpan={8}
                                className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white"
                              >
                                <div className="space-y-5">
                                  {/* 3 Column Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Customer Info */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                          <User
                                            size={14}
                                            className="text-[#004b9c]"
                                          />
                                        </div>
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                          Customer Information
                                        </h4>
                                      </div>
                                      <p className="font-semibold text-gray-800 text-[13px]">
                                        {order.customerName}
                                      </p>
                                      <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-1">
                                        <Mail size={11} /> {order.customerEmail}
                                      </p>
                                      <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-1">
                                        <Phone size={11} />{" "}
                                        {order.customerPhone}
                                      </p>
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                          <TruckIcon
                                            size={14}
                                            className="text-green-600"
                                          />
                                        </div>
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                          Shipping Information
                                        </h4>
                                      </div>
                                      <p className="text-[12px] text-gray-700 flex items-start gap-1">
                                        <MapPin
                                          size={11}
                                          className="flex-shrink-0 mt-0.5"
                                        />
                                        <span>
                                          {order.deliveryAddress}, {order.city}
                                          {order.emirate
                                            ? `, ${order.emirate}`
                                            : ""}
                                        </span>
                                      </p>
                                      <p className="text-[12px] text-gray-500 mt-2">
                                        <span className="font-semibold">
                                          Delivery:
                                        </span>{" "}
                                        {order.deliveryMethod === "express"
                                          ? "🚀 Express Shipping"
                                          : "📦 Standard Delivery"}
                                      </p>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                                          <CreditCard
                                            size={14}
                                            className="text-purple-600"
                                          />
                                        </div>
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                          Payment Information
                                        </h4>
                                      </div>
                                      <p className="text-[12px] text-gray-700">
                                        <span className="font-semibold">
                                          Method:
                                        </span>{" "}
                                        {order.paymentMethod.toUpperCase()}
                                      </p>
                                      <p className="text-[12px] text-gray-700 mt-2">
                                        <span className="font-semibold">
                                          Order Date:
                                        </span>{" "}
                                        {new Date(
                                          order.createdAt,
                                        ).toLocaleString("en-AE")}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <ShoppingBag
                                          size={14}
                                          className="text-amber-600"
                                        />
                                      </div>
                                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                        Order Items
                                      </h4>
                                    </div>
                                    <div className="space-y-2">
                                      {order.items.map((item, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                          <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                              <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <Package
                                                size={20}
                                                className="text-gray-300"
                                              />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[13px] text-gray-800 truncate">
                                              {item.name}
                                            </p>
                                            {item.brand && (
                                              <p className="text-[10px] text-[#81bf42] font-semibold">
                                                {item.brand}
                                              </p>
                                            )}
                                            <p className="text-[11px] text-gray-400">
                                              Size: {item.size ?? "-"} · Qty:{" "}
                                              {item.quantity}
                                            </p>
                                          </div>
                                          <p className="font-black text-[#004b9c] text-[13px] flex-shrink-0">
                                            AED{" "}
                                            {(
                                              item.price * item.quantity
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Order Summary */}
                                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <FileText
                                          size={14}
                                          className="text-[#004b9c]"
                                        />
                                      </div>
                                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                        Order Summary
                                      </h4>
                                    </div>
                                    <div className="space-y-2 max-w-xs ml-auto">
                                      <div className="flex justify-between text-[13px]">
                                        <span className="text-gray-500">
                                          Subtotal
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                          AED{" "}
                                          {(
                                            order.subtotal || order.totalAmount
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      {order.discount && order.discount > 0 && (
                                        <div className="flex justify-between text-[13px]">
                                          <span className="text-green-600">
                                            Discount
                                          </span>
                                          <span className="font-semibold text-green-600">
                                            -AED{" "}
                                            {order.discount.toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-[13px]">
                                        <span className="text-gray-500">
                                          Shipping
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                          {order.shippingCost === 0
                                            ? "FREE"
                                            : `AED ${order.shippingCost?.toLocaleString() || "25"}`}
                                        </span>
                                      </div>
                                      <div className="border-t border-gray-100 pt-2 mt-2">
                                        <div className="flex justify-between">
                                          <span className="font-bold text-gray-900">
                                            Total
                                          </span>
                                          <span className="font-black text-[#004b9c] text-[18px]">
                                            AED{" "}
                                            {order.totalAmount.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Notes */}
                                  {order.notes && (
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                      <div className="flex items-start gap-2">
                                        <FileText
                                          size={14}
                                          className="text-amber-600 flex-shrink-0 mt-0.5"
                                        />
                                        <div>
                                          <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                                            Order Notes
                                          </h4>
                                          <p className="text-[12px] text-amber-800 mt-1">
                                            {order.notes}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-[12px] text-gray-500">
                    Showing {(page - 1) * 20 + 1} to{" "}
                    {Math.min(page * 20, total)} of {total} orders
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
                    >
                      ← Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;
                        let startPage = Math.max(
                          1,
                          page - Math.floor(maxVisible / 2),
                        );
                        let endPage = Math.min(
                          totalPages,
                          startPage + maxVisible - 1,
                        );
                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        return pages.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all ${
                              page === pageNum
                                ? "bg-[#004b9c] text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ));
                      })()}
                    </div>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#004b9c] to-[#0062cc] px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-blue-100 uppercase tracking-wider">
                      Order Details
                    </p>
                    <h2 className="text-[18px] font-black">
                      {selectedOrder.orderNumber}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Status changer */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      const active = selectedOrder.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedOrder._id, s)}
                          disabled={updatingId === selectedOrder._id}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                            active
                              ? `${cfg.bg} ${cfg.color} border-current`
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {active && (
                            <Check size={10} className="inline mr-1" />
                          )}
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer info */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={12} /> Customer
                  </p>
                  <p className="font-bold text-gray-800 text-[14px]">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-[13px] text-gray-500 flex items-center gap-1 mt-1">
                    <Mail size={11} /> {selectedOrder.customerEmail}
                  </p>
                  <p className="text-[13px] text-gray-500 flex items-center gap-1 mt-1">
                    <Phone size={11} /> {selectedOrder.customerPhone}
                  </p>
                  <p className="text-[13px] text-gray-500 flex items-start gap-1 mt-2">
                    <MapPin size={11} className="mt-0.5" />
                    {selectedOrder.deliveryAddress}, {selectedOrder.city}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-[12px] text-amber-600 mt-2 italic flex items-start gap-1">
                      <FileText size={11} className="mt-0.5" /> Note:{" "}
                      {selectedOrder.notes}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShoppingBag size={12} /> Items (
                    {selectedOrder.items.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Size: {item.size ?? "-"} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-black text-[#004b9c] text-[13px] flex-shrink-0">
                          AED {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Payment
                    </p>
                    <p className="font-bold text-gray-700 mt-0.5 uppercase text-[13px]">
                      {selectedOrder.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : selectedOrder.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Total
                    </p>
                    <p className="text-[22px] font-black text-[#004b9c]">
                      AED {selectedOrder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
