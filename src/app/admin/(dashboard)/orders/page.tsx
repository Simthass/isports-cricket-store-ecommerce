// src/app/admin/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Search, ChevronDown, Eye, Check,
  Truck, X, Loader2, RefreshCw, Filter,
} from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  paymentMethod: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pending",    color: "text-amber-600",  bg: "bg-amber-50 border-amber-200"  },
  CONFIRMED:  { label: "Confirmed",  color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"    },
  PROCESSING: { label: "Processing", color: "text-purple-600", bg: "bg-purple-50 border-purple-200"},
  SHIPPED:    { label: "Shipped",    color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200"},
  DELIVERED:  { label: "Delivered",  color: "text-green-600",  bg: "bg-green-50 border-green-200"  },
  CANCELLED:  { label: "Cancelled",  color: "text-red-600",    bg: "bg-red-50 border-red-200"      },
};

const ALL_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / 20);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
        }
      }
    } finally {
      setUpdatingId(null);
    }
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

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">Order Management</h1>
            <p className="text-gray-400 text-[13px] mt-1">{total} total orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => { setFilterStatus("ALL"); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
              filterStatus === "ALL"
                ? "bg-[#004b9c] text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            All ({total})
          </button>
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  filterStatus === s
                    ? "bg-[#004b9c] text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {cfg.label} {counts[s] > 0 && `(${counts[s]})`}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#004b9c]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Package size={48} className="text-gray-200" strokeWidth={1.2} />
              <p className="text-gray-400 font-semibold">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Order</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden md:table-cell">Date</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden lg:table-cell">Payment</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Status</th>
                    <th className="text-right px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Total</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const cfg = STATUS_CONFIG[order.status];
                    const isUpdating = updatingId === order._id;
                    return (
                      <tr
                        key={order._id}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#004b9c]">{order.orderNumber}</p>
                          <p className="text-gray-400 text-[11px]">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800">{order.customerName}</p>
                          <p className="text-gray-400 text-[11px]">{order.customerPhone}</p>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-AE", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-[11px] font-bold border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isUpdating ? (
                            <Loader2 size={16} className="animate-spin text-[#004b9c]" />
                          ) : (
                            <div className="relative group">
                              <select
                                value={order.status}
                                onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer appearance-none pr-6 focus:outline-none ${cfg.bg} ${cfg.color}`}
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                ))}
                              </select>
                              <ChevronDown size={10} className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${cfg.color}`} />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-black text-[#004b9c]">AED {order.totalAmount.toLocaleString()}</p>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#004b9c] transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-[13px] text-gray-500 font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
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
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[16px] font-black text-gray-900">{selectedOrder.orderNumber}</h2>
                    <p className="text-[12px] text-gray-400">
                      {new Date(selectedOrder.createdAt).toLocaleString("en-AE")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Status changer */}
                <div className="mb-6">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Update Status</label>
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
                          {active && <Check size={10} className="inline mr-1" />}
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Customer</p>
                  <p className="font-bold text-gray-800 text-[14px]">{selectedOrder.customerName}</p>
                  <p className="text-[13px] text-gray-500">{selectedOrder.customerEmail}</p>
                  <p className="text-[13px] text-gray-500">{selectedOrder.customerPhone}</p>
                  <p className="text-[13px] text-gray-500 mt-2">
                    📍 {selectedOrder.deliveryAddress}, {selectedOrder.city}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-[12px] text-gray-400 mt-2 italic">Note: {selectedOrder.notes}</p>
                  )}
                </div>

                {/* Items */}
                <div className="mb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Items</p>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] text-gray-800 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-400">
                            Size: {item.size ?? "-"} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-black text-[#004b9c] text-[13px] flex-shrink-0">
                          AED {item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment</p>
                    <p className="font-bold text-gray-700 mt-0.5 uppercase text-[13px]">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-[20px] font-black text-[#004b9c]">AED {selectedOrder.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}