"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Search, Filter, ChevronDown, ChevronUp,
  Loader2, RefreshCw, CheckCircle, XCircle, Clock,
  Package, User, Phone, Mail, MapPin, Edit2, Save,
  X, Plus, Minus, Trash2, ShoppingBag, DollarSign, SaveAll,
  Search as SearchIcon, AlertCircle, Truck, CreditCard,
} from "lucide-react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toast";

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

interface ProductSearchResult {
  _id: string;
  name: string;
  price: number;
  images: string[];
  brandId: { name: string };
  sizes: string[];
  inStock: boolean;
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
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Product search modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSizeForProduct, setSelectedSizeForProduct] = useState<Record<string, string>>({});
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Search products with debounce
  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle search input with debounce
  const handleProductSearch = (query: string) => {
    setProductSearch(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => searchProducts(query), 500);
    setSearchTimeout(timeout);
  };

  // Add product to order
  const addProductToOrder = (product: ProductSearchResult) => {
    const size = selectedSizeForProduct[product._id] || (product.sizes?.[0] || "Standard");
    
    const newItem: OrderItem = {
      productId: product._id,
      name: product.name,
      brand: product.brandId?.name || "",
      price: product.price,
      quantity: 1,
      size: size,
      image: product.images?.[0],
    };
    
    setEditingItems([...editingItems, newItem]);
    setProductSearch("");
    setShowProductModal(false);
    setSearchResults([]);
  };

  // Update item quantity
  const updateItemQuantity = (index: number, delta: number) => {
    const newItems = [...editingItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setEditingItems(newItems);
  };

  // Remove item from order
  const removeItem = (index: number) => {
    const newItems = editingItems.filter((_, i) => i !== index);
    setEditingItems(newItems);
  };

  // Update item size
  const updateItemSize = (index: number, newSize: string) => {
    const newItems = [...editingItems];
    newItems[index].size = newSize;
    setEditingItems(newItems);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;
    return { subtotal, total };
  };

const updateOrder = async (orderId: string, status: string) => {
  setUpdating(true);
  try {
    const { subtotal, total } = calculateTotals();
    
    const body: any = { 
      status,
      items: editingItems,
      adminNotes: adminNotes,
      deliveryAddress: deliveryAddress,
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      subtotal,
      total,
    };

    const res = await fetch(`/api/whatsapp/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchOrders();
      setEditingOrder(null);
      setEditingItems([]);
      setShowProductModal(false);
      showToast("success", "Order Updated", `Order ${status === "CONFIRMED" ? "confirmed" : "cancelled"} successfully`);
    } else {
      const error = await res.json();
      showToast("error", "Update Failed", error.error || "Failed to update order");
    }
  } catch (error) {
    console.error("Error updating order:", error);
    showToast("error", "Something went wrong", "Please try again");
  } finally {
    setUpdating(false);
  }
};

  const startEditing = (order: WhatsAppOrder) => {
    setEditingOrder(order);
    setEditingItems([...order.items]);
    setAdminNotes(order.adminNotes || "");
    setDeliveryAddress(order.deliveryAddress || "");
    setCustomerName(order.customerInfo.name);
    setCustomerPhone(order.customerInfo.phone);
    setCustomerEmail(order.customerInfo.email || "");
  };

  const cancelEditing = () => {
    setEditingOrder(null);
    setEditingItems([]);
    setAdminNotes("");
    setDeliveryAddress("");
    setShowProductModal(false);
    setProductSearch("");
    setSearchResults([]);
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

  const { subtotal: editSubtotal, total: editTotal } = calculateTotals();

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
          <div className="flex gap-2 flex-wrap">
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
                        {/* Edit Mode or View Mode */}
                        {editingOrder?._id === order._id ? (
                          // EDIT MODE
                          <div className="space-y-5">
                            {/* Customer Info Edit */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User size={12} /> Customer Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Full Name</label>
                                  <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-[#004b9c]"
                                    placeholder="Customer name"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Phone Number</label>
                                  <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-[#004b9c]"
                                    placeholder="+971 XX XXX XXXX"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Email (Optional)</label>
                                  <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-[#004b9c]"
                                    placeholder="customer@example.com"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Delivery Address Edit */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Truck size={12} /> Delivery Address
                              </h4>
                              <textarea
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Enter complete delivery address..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#004b9c] resize-none"
                              />
                              <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                                <AlertCircle size={10} />
                                Required before confirming order
                              </p>
                            </div>

                            {/* Order Items Edit */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                  <Package size={12} /> Order Items
                                </h4>
                                <button
                                  onClick={() => {
                                    setShowProductModal(true);
                                    setProductSearch("");
                                    setSearchResults([]);
                                  }}
                                  className="text-[11px] bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <Plus size={12} /> Add Product
                                </button>
                              </div>
                              
                              {editingItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-[13px]">
                                  No items added. Click "Add Product" to add items.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {editingItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Package size={20} className="text-gray-300" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-[13px] truncate">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <select
                                            value={item.size}
                                            onChange={(e) => updateItemSize(idx, e.target.value)}
                                            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 bg-white"
                                          >
                                            <option value="Standard">Standard</option>
                                            <option value="Small">Small</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Large">Large</option>
                                            <option value="X-Large">X-Large</option>
                                          </select>
                                          <span className="text-[11px] text-gray-400">AED {item.price}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => updateItemQuantity(idx, -1)}
                                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                        >
                                          <Minus size={12} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-[13px]">{item.quantity}</span>
                                        <button
                                          onClick={() => updateItemQuantity(idx, 1)}
                                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                        >
                                          <Plus size={12} />
                                        </button>
                                        <button
                                          onClick={() => removeItem(idx)}
                                          className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Order Summary during edit */}
                              {editingItems.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex justify-between text-[13px]">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(editSubtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-[13px] mt-1">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-bold">To be calculated</span>
                                  </div>
                                  <div className="flex justify-between text-[16px] font-black text-[#004b9c] mt-2 pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>{formatCurrency(editTotal)}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Admin Notes Edit */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Edit2 size={12} /> Admin Notes
                              </h4>
                              <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes about this order..."
                                rows={2}
                                className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#004b9c] resize-none"
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-3">
                              <button
                                onClick={cancelEditing}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => updateOrder(order._id, "CANCELLED")}
                                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                              >
                                <XCircle size={16} />
                                Cancel Order
                              </button>
                              <button
                                onClick={() => updateOrder(order._id, "CONFIRMED")}
                                disabled={!deliveryAddress.trim() || editingItems.length === 0}
                                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-[13px] font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle size={16} />
                                Confirm Order
                              </button>
                            </div>
                          </div>
                        ) : (
                          // VIEW MODE
                          <div className="space-y-5">
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
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-[12px] text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                  </div>
                                )}
                                {order.shippingCost > 0 && (
                                  <div className="flex justify-between text-[12px]">
                                    <span>Shipping</span>
                                    <span>{formatCurrency(order.shippingCost)}</span>
                                  </div>
                                )}
                                <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-[#004b9c]">
                                  <span>Total</span>
                                  <span>{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Address */}
                            {order.deliveryAddress && (
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Truck size={12} /> Delivery Address
                                </h4>
                                <p className="text-[13px] text-gray-700">{order.deliveryAddress}</p>
                              </div>
                            )}

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
                            {order.adminNotes && (
                              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Admin Notes</p>
                                <p className="text-[12px] text-gray-700">{order.adminNotes}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {order.status === "WAITING_CONFIRMATION" && (
                              <div className="flex gap-3 pt-3">
                                <button
                                  onClick={() => startEditing(order)}
                                  className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[13px] font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Edit2 size={16} />
                                  Edit Order
                                </button>
                              </div>
                            )}
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

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowProductModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Add Product to Order</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Search and select products to add</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="relative mb-4">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  placeholder="Search products by name..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-[#004b9c]"
                  autoFocus
                />
              </div>
              
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-[#004b9c]" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <div key={product._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-[13px] truncate">{product.name}</p>
                          <p className="text-[11px] text-gray-500">{product.brandId?.name || "No brand"} • AED {product.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedSizeForProduct[product._id] || (product.sizes?.[0] || "Standard")}
                            onChange={(e) => setSelectedSizeForProduct(prev => ({ ...prev, [product._id]: e.target.value }))}
                            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                          >
                            {(product.sizes?.length > 0 ? product.sizes : ["Standard"]).map((size) => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => addProductToOrder(product)}
                            className="px-3 py-1.5 rounded-lg bg-[#004b9c] text-white text-[11px] font-semibold hover:bg-[#003d82] transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))
                  ) : productSearch.length > 1 ? (
                    <div className="text-center py-8 text-gray-500 text-[13px]">
                      No products found. Try a different search term.
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-[13px]">
                      Type at least 2 characters to search products
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}