"use client";

// app/account/orders/page.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Eye,
  Loader2,
  ShoppingBag,
  Calendar,
  MapPin,
  CreditCard,
} from "lucide-react";

interface OrderItem {
  productId: string;
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
  status: string;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  deliveryMethod?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  CONFIRMED: {
    icon: Package,
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  PROCESSING: {
    icon: Package,
    label: "Processing",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  SHIPPED: {
    icon: Truck,
    label: "Shipped",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  DELIVERED: {
    icon: CheckCircle2,
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  CANCELLED: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  PAID: {
    icon: CheckCircle2,
    label: "Paid",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

const statusOptions = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PAID", label: "Paid" },
];

export default function MyOrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/account/orders");
    }
  }, [sessionStatus, router]);

  const fetchOrders = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", "10");
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/users/orders?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders);
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
        });
      } else {
        console.error("Failed to fetch orders:", data.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [session, pagination.page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/users/orders/${orderId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSelectedOrder(data.order);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.PENDING;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#004b9c] animate-spin" />
          <p className="text-gray-400 text-[14px] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#004b9c] to-[#003d82] overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('/pattern-grid.svg')] bg-repeat" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-12 lg:py-16">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/account"
              className="text-blue-200 hover:text-white transition-colors text-sm"
            >
              Account
            </Link>
            <ChevronRight size={14} className="text-blue-300" />
            <span className="text-white font-medium">My Orders</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white italic uppercase">
            My Orders
          </h1>
          <p className="text-blue-200 text-[14px] mt-2">
            Track and manage your order history
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </section>

      {/* Main Content */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-12 lg:py-16">
        {/* Status Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  statusFilter === option.value
                    ? "bg-[#004b9c] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="text-[#004b9c] animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl border border-gray-100"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No orders found
            </h3>
            <p className="text-gray-400 text-[14px] mb-6">
              {statusFilter !== "ALL"
                ? `You don't have any ${statusFilter.toLowerCase()} orders.`
                : "You haven't placed any orders yet."}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#004b9c] text-white text-[13px] font-bold rounded-xl hover:bg-[#003d82] transition-colors"
            >
              Start Shopping <ShoppingBag size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${statusInfo.bg} flex items-center justify-center`}
                          >
                            <StatusIcon
                              size={18}
                              className={statusInfo.color}
                            />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">
                              Order #{order.orderNumber}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[16px] font-bold text-[#004b9c]">
                            AED {order.totalAmount.toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:border-[#004b9c] hover:text-[#004b9c] transition-all"
                          >
                            <Eye size={12} /> View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-4">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    size={16}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-gray-800 line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                Qty: {item.quantity}{" "}
                                {item.size && `· Size: ${item.size}`}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-[12px] font-bold text-gray-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-4">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-[12px] text-gray-500 px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-black text-gray-900">
                      Order Details
                    </h2>
                    <p className="text-[12px] text-gray-400">
                      #{selectedOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedOrder.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <>
                          <div
                            className={`w-12 h-12 rounded-xl ${statusInfo.bg} flex items-center justify-center`}
                          >
                            <StatusIcon
                              size={22}
                              className={statusInfo.color}
                            />
                          </div>
                          <div>
                            <p className="text-[13px] text-gray-500">
                              Order Status
                            </p>
                            <p
                              className={`text-[16px] font-bold ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingBag size={14} className="text-[#004b9c]" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                      <p>
                        <span className="text-gray-500">Name:</span>{" "}
                        {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        {selectedOrder.customerEmail}
                      </p>
                      <p>
                        <span className="text-gray-500">Phone:</span>{" "}
                        {selectedOrder.customerPhone}
                      </p>
                      <p>
                        <span className="text-gray-500">Payment:</span>{" "}
                        {selectedOrder.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin size={14} className="text-[#004b9c]" />
                      Delivery Address
                    </h3>
                    <p className="text-[13px] text-gray-600 bg-gray-50 p-3 rounded-xl">
                      {selectedOrder.deliveryAddress}, {selectedOrder.city}
                      {selectedOrder.emirate && `, ${selectedOrder.emirate}`}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package size={14} className="text-[#004b9c]" />
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 rounded-xl bg-gray-50"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-gray-800">
                              {item.name}
                            </p>
                            {item.brand && (
                              <p className="text-[11px] text-gray-400">
                                {item.brand}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                              <span>Qty: {item.quantity}</span>
                              {item.size && <span>Size: {item.size}</span>}
                              <span>
                                Price: AED {item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-bold text-gray-900">
                              AED{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>
                          AED{" "}
                          {(
                            selectedOrder.subtotal || selectedOrder.totalAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                      {selectedOrder.discount && selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-green-600">Discount:</span>
                          <span className="text-green-600">
                            -AED {selectedOrder.discount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedOrder.shippingCost !== undefined && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-gray-500">Shipping:</span>
                          <span>
                            {selectedOrder.shippingCost === 0
                              ? "FREE"
                              : `AED ${selectedOrder.shippingCost.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-[16px] font-bold pt-2 border-t border-gray-100">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-[#004b9c]">
                          AED {selectedOrder.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 rounded-xl bg-[#004b9c] text-white text-[13px] font-bold hover:bg-[#003d82] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
