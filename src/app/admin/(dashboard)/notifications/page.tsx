"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShoppingBag, Package, Truck, CheckCircle2,
  XCircle, Clock, Loader2, ArrowLeft, Trash2,
  Check, Eye, Filter, Calendar,
} from "lucide-react";

interface Notification {
  id: string;
  type: "order" | "stock" | "system" | "payment";
  title: string;
  message: string;
  orderId?: string;
  productId?: string;
  read: boolean;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #ISP-MNN3AZW0-MUZZ has been placed. Total: AED 649",
    orderId: "ISP-MNN3AZW0-MUZZ",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "order",
    title: "Order Confirmed",
    message: "Order #ISP-ABC123 has been confirmed by customer",
    orderId: "ISP-ABC123",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "stock",
    title: "Low Stock Alert",
    message: "SS Ton Ranger Bat - Only 2 units left in stock",
    productId: "prod_123",
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    message: "Payment of AED 299 received for Order #ISP-DEF456",
    orderId: "ISP-DEF456",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    type: "system",
    title: "System Update",
    message: "New version 2.0.0 is available. Click to update.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const getTypeIcon = (type: Notification["type"]) => {
  switch (type) {
    case "order":
      return <ShoppingBag size={16} className="text-blue-500" />;
    case "stock":
      return <Package size={16} className="text-amber-500" />;
    case "payment":
      return <CheckCircle2 size={16} className="text-green-500" />;
    case "system":
      return <Bell size={16} className="text-purple-500" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

const getTypeBg = (type: Notification["type"]) => {
  switch (type) {
    case "order":
      return "bg-blue-50 border-blue-100";
    case "stock":
      return "bg-amber-50 border-amber-100";
    case "payment":
      return "bg-green-50 border-green-100";
    case "system":
      return "bg-purple-50 border-purple-100";
    default:
      return "bg-gray-50 border-gray-100";
  }
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedType, setSelectedType] = useState<Notification["type"] | "all">("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (selectedType !== "all" && n.type !== selectedType) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedNotifications((prev) => prev.filter((sid) => sid !== id));
  };

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    setSelectMode(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
  };

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    orders: notifications.filter((n) => n.type === "order").length,
    stock: notifications.filter((n) => n.type === "stock").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-gray-500 hover:text-[#004b9c] transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-[13px] font-medium">Back to Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic">Notifications</h1>
              <p className="text-gray-400 text-[13px] mt-1">Manage your alerts and updates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
            <button
              onClick={() => setSelectMode(!selectMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
            {selectMode && selectedNotifications.length > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-[13px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
                Delete ({selectedNotifications.length})
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unread</p>
            <p className="text-2xl font-black text-blue-600">{stats.unread}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Read</p>
            <p className="text-2xl font-black text-gray-600">{stats.read}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Orders</p>
            <p className="text-2xl font-black text-blue-600">{stats.orders}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock Alerts</p>
            <p className="text-2xl font-black text-amber-600">{stats.stock}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                filter === "all"
                  ? "bg-[#004b9c] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                filter === "unread"
                  ? "bg-[#004b9c] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                filter === "read"
                  ? "bg-[#004b9c] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Read
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 bg-white focus:outline-none focus:border-[#004b9c]"
            >
              <option value="all">All Types</option>
              <option value="order">Orders</option>
              <option value="stock">Stock Alerts</option>
              <option value="payment">Payments</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#004b9c]" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Bell size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No notifications found</p>
              <p className="text-gray-300 text-[12px] mt-1">All caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isSelected = selectedNotifications.includes(notification.id);
              const typeBg = getTypeBg(notification.type);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl border transition-all ${
                    notification.read
                      ? "border-gray-100 opacity-80"
                      : "border-l-4 border-l-blue-500 border-gray-100 shadow-sm"
                  } ${isSelected ? "ring-2 ring-[#004b9c]" : ""}`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Select checkbox in select mode */}
                      {selectMode && (
                        <button
                          onClick={() => toggleSelect(notification.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            isSelected
                              ? "bg-[#004b9c] border-[#004b9c]"
                              : "border-gray-300 hover:border-[#004b9c]"
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </button>
                      )}

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${typeBg} flex items-center justify-center flex-shrink-0`}>
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className={`text-[14px] font-bold ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                              {notification.title}
                            </h3>
                            <p className="text-[13px] text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Calendar size={10} />
                                {formatTime(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {notification.orderId && (
                              <Link
                                href={`/admin/orders`}
                                className="p-2 rounded-lg text-gray-400 hover:text-[#004b9c] hover:bg-blue-50 transition-colors"
                              >
                                <Eye size={15} />
                              </Link>
                            )}
                            {!notification.read ? (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                title="Mark as read"
                              >
                                <Check size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => markAsUnread(notification.id)}
                                className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Mark as unread"
                              >
                                <Clock size={15} />
                              </button>
                            )}
                            {!selectMode && (
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination (if needed for real API) */}
        {/* <div className="flex justify-center mt-6">
          <button className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
            Load More
          </button>
        </div> */}
      </div>
    </div>
  );
}