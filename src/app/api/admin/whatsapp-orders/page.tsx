"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Search, Filter, ChevronDown, ChevronUp,
  Loader2, RefreshCw, CheckCircle, XCircle, Clock,
  Package, User, Phone, Mail, MapPin, Edit2, Save,
  X, Plus, Minus, Trash2, ShoppingBag, DollarSign,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
}

interface WhatsAppOrder {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  originalItems: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  status: "PENDING" | "WAITING_CONFIRMATION" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentMethod: string;
  deliveryAddress?: string;
  adminNotes?: string;
  customerNotes?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export default function AdminWhatsAppOrdersPage() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<WhatsAppOrder | null>(null);
  const [editingItems, setEditingItems] = useState<OrderItem[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [updating, setUpdating] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: "20",
      });
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search) params.set("search", search);

      const res = await fetch(`/api/whatsapp/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPendingCount(data.pendingCount || 0);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filterStatus, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrder = async (orderId: string, status: string, items?: OrderItem[]) => {
    setUpdating(true);
    try {
      const body: any = { status };
      if (items) body.items = items;
      if (adminNotes) body.adminNotes = adminNotes;
      if (deliveryAddress) body.deliveryAddress = deliveryAddress;

      const res = await fetch(`/api/whatsapp/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchOrders();
        setEditingOrder(null);
        setEditingItems([]);
        setAdminNotes("");
        setDeliveryAddress("");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;
    await updateOrder(orderId, "CANCELLED");
  };

  const confirmOrder = async (orderId: string) => {
    if (!confirm("Confirm this order? Stock will be reduced.")) return;
    await updateOrder(orderId, "CONFIRMED");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-AE", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => `AED ${amount.toLocaleString()}`;

  const statusColors = {
    WAITING_CONFIRMATION: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    PENDING: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusIcons = {
    WAITING_CONFIRMATION: <Clock size={12} />,
    CONFIRMED: <CheckCircle size={12} />,
    CANCELLED: <XCircle size={12} />,
    COMPLETED: <Package size={12} />,
    PENDING: <Clock size={12} />,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">WhatsApp Order Management</h1>
            <p className="text-gray-400 text-[13px] mt-1">
              Manage orders placed via WhatsApp
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
                  {pendingCount} pending confirmation
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {["all", "WAITING_CONFIRMATION", "CONFIRMED", "CANCELLED", "COMPLETED"].map((status) => {
              const label = status === "all" ? "All" :
                status === "WAITING_CONFIRMATION" ? "Pending" :
                status === "CONFIRMED" ? "Confirmed" :
                status === "CANCELLED" ? "Cancelled" : "Completed";
              const count = status === "all" ? pagination.total :
                status === "WAITING_CONFIRMATION" ? pendingCount :
                orders.filter(o => o.status === status).length;
              
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                    filterStatus === status
                      ? "bg-[#004b9c] text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] w-64 focus:outline-none focus:border-[#004b9c]"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#004b9c]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No WhatsApp orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageCircle size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#004b9c]">{order.orderNumber}</p>
                        <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                        {statusIcons[order.status]}
                        {order.status === "WAITING_CONFIRMATION" ? "Pending" : order.status}
                      </span>
                      <p className="font-black text-[#004b9c] text-[15px]">{formatCurrency(order.total)}</p>
                      {expandedId === order._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-[12px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {order.customerInfo.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {order.customerInfo.phone}
                    </span>
                    {order.items.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Package size={12} /> {order.items.length} items
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50/50"
                    >
                      <div className="p-5 space-y-5">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h4>
                            <p className="font-semibold text-gray-800">{order.customerInfo.name}</p>
                            <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-1">
                              <Phone size={11} /> {order.customerInfo.phone}
                            </p>
                            {order.customerInfo.email && (
                              <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-1">
                                <Mail size={11} /> {order.customerInfo.email}
                              </p>
                            )}
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</h4>
                            <div className="flex justify-between text-[12px]">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-[#004b9c]">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package size={20} className="text-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 text-[13px]">{item.name}</p>
                                  <p className="text-[11px] text-gray-400">{item.size} • {item.brand}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-[#004b9c] text-[13px]">{formatCurrency(item.price * item.quantity)}</p>
                                  <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {order.status === "WAITING_CONFIRMATION" && editingOrder?._id === order._id ? (
                          <div>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about this order..."
                              rows={2}
                              className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#004b9c]"
                            />
                            <input
                              type="text"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              placeholder="Delivery Address"
                              className="w-full border border-gray-200 rounded-xl p-3 text-[13px] mt-3 focus:outline-none focus:border-[#004b9c]"
                            />
                          </div>
                        ) : order.adminNotes && (
                          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Admin Notes</p>
                            <p className="text-[12px] text-gray-700">{order.adminNotes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {order.status === "WAITING_CONFIRMATION" && (
                          <div className="flex gap-3 pt-3">
                            <button
                              onClick={() => cancelOrder(order._id)}
                              disabled={updating}
                              className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} />
                              Cancel Order
                            </button>
                            <button
                              onClick={() => confirmOrder(order._id)}
                              disabled={updating}
                              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-[13px] font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Confirm Order
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-[13px] text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}