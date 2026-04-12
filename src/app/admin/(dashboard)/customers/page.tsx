"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, ChevronDown, Eye, Trash2, ChevronRight,
  Loader2, RefreshCw, Filter, Mail, Phone,
  MapPin, Calendar, DollarSign, ShoppingBag,
  X, Check, AlertCircle, MoreVertical, ChevronUp,
} from "lucide-react";
import Image from "next/image";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  emirate: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  image?: string;
}

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface CustomerDetails {
  customer: Customer;
  orders: any[];
  orderStats: OrderStats;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<Map<string, CustomerDetails>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string[]>([]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: "20",
        sortBy,
        sortOrder,
      });
      if (search) params.set("search", search);
      if (filterRole !== "all") params.set("role", filterRole);
      
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, sortBy, sortOrder, search, filterRole]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const fetchCustomerDetails = async (id: string) => {
    if (customerDetails.has(id)) {
      // Toggle expand/collapse
      setExpandedCustomerId(expandedCustomerId === id ? null : id);
      return;
    }
    
    setLoadingDetails(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      setCustomerDetails(prev => new Map(prev).set(id, data));
      setExpandedCustomerId(id);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const updateCustomer = async () => {
    if (!editingCustomer) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCustomer),
      });
      if (res.ok) {
        await fetchCustomers();
        setEditingCustomer(null);
        // Clear cached details for this customer
        setCustomerDetails(prev => {
          const newMap = new Map(prev);
          newMap.delete(editingCustomer._id);
          return newMap;
        });
        setExpandedCustomerId(null);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteCustomers = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} customer(s)?`)) return;
    setDeleting(ids);
    try {
      const res = await fetch(`/api/admin/customers?ids=${ids.join(",")}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCustomers();
        setSelectedCustomers([]);
        setSelectMode(false);
      }
    } catch (error) {
      console.error("Error deleting customers:", error);
    } finally {
      setDeleting([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c._id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const isLoadingDetails = (id: string) => loadingDetails.has(id);
  const getCustomerDetails = (id: string) => customerDetails.get(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">Customer Management</h1>
            <p className="text-gray-400 text-[13px] mt-1">{pagination.total} total customers</p>
          </div>
          <div className="flex gap-3">
            {selectMode && selectedCustomers.length > 0 && (
              <button
                onClick={() => deleteCustomers(selectedCustomers)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
                Delete ({selectedCustomers.length})
              </button>
            )}
            <button
              onClick={() => {
                setSelectMode(!selectMode);
                if (selectMode) setSelectedCustomers([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-colors ${
                selectMode
                  ? "bg-[#004b9c] text-white border-[#004b9c]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
            <button
              onClick={fetchCustomers}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-white"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-600 bg-white focus:outline-none focus:border-[#004b9c]"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#004b9c]" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Users size={48} className="text-gray-200" strokeWidth={1.2} />
              <p className="text-gray-400 font-semibold">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="w-8 px-3 py-4" />
                    {selectMode && (
                      <th className="w-10 px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === customers.length && customers.length > 0}
                          onChange={selectAll}
                          className="w-4 h-4 rounded border-gray-300 text-[#004b9c] focus:ring-[#004b9c]"
                        />
                      </th>
                    )}
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden md:table-cell">Contact</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden lg:table-cell">Location</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Orders</th>
                    <th className="text-left px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px] hidden lg:table-cell">Joined</th>
                    <th className="text-right px-5 py-4 font-black text-gray-500 uppercase tracking-wider text-[11px]">Total Spent</th>
                    <th className="px-3 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, idx) => {
                    const isExpanded = expandedCustomerId === customer._id;
                    const details = getCustomerDetails(customer._id);
                    const isLoading = isLoadingDetails(customer._id);
                    
                    return (
                      <React.Fragment key={customer._id}>
                        <tr
                          className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}
                        >
                          {/* Expand/Collapse Arrow */}
                          <td className="px-3 py-4">
                            <button
                              onClick={() => fetchCustomerDetails(customer._id)}
                              className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                            >
                              {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          </td>
                          
                          {selectMode && (
                            <td className="px-3 py-4">
                              <input
                                type="checkbox"
                                checked={selectedCustomers.includes(customer._id)}
                                onChange={() => toggleSelect(customer._id)}
                                className="w-4 h-4 rounded border-gray-300 text-[#004b9c] focus:ring-[#004b9c]"
                              />
                            </td>
                          )}
                          
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#004b9c] font-bold text-[14px]">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{customer.name}</p>
                                <p className="text-gray-400 text-[11px]">{customer.role}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-gray-600 text-[12px]">{customer.email}</p>
                            <p className="text-gray-400 text-[11px] mt-0.5">{customer.phone || "No phone"}</p>
                          </td>
                          
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <p className="text-gray-500 text-[12px]">{customer.city || "—"}</p>
                            <p className="text-gray-400 text-[11px]">{customer.emirate || "—"}</p>
                          </td>
                          
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-800">{customer.totalOrders}</p>
                          </td>
                          
                          <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-[12px]">
                            {formatDate(customer.createdAt)}
                          </td>
                          
                          <td className="px-5 py-4 text-right">
                            <p className="font-black text-[#004b9c]">{formatCurrency(customer.totalSpent)}</p>
                          </td>
                          
                          <td className="px-3 py-4">
                            <button
                              onClick={() => setEditingCustomer(customer)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#004b9c] transition-colors"
                              title="Edit Customer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                                <path d="M4 20h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Row with Customer Details */}
                        {isExpanded && details && (
                          <tr className="bg-gray-50/80">
                            <td colSpan={selectMode ? 9 : 8} className="px-6 py-5">
                              <div className="space-y-5">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <ShoppingBag size={18} className="text-blue-600 mb-2" />
                                    <p className="text-[20px] font-black text-blue-600">{details.orderStats.totalOrders}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Orders</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <DollarSign size={18} className="text-green-600 mb-2" />
                                    <p className="text-[20px] font-black text-green-600">{formatCurrency(details.orderStats.totalSpent)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Spent</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <ShoppingBag size={18} className="text-purple-600 mb-2" />
                                    <p className="text-[20px] font-black text-purple-600">{formatCurrency(details.orderStats.averageOrderValue)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg. Order Value</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <Calendar size={18} className="text-amber-600 mb-2" />
                                    <p className="text-[12px] font-bold text-amber-600">
                                      {details.orderStats.lastOrderDate 
                                        ? formatDate(details.orderStats.lastOrderDate)
                                        : "No orders"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Last Order</p>
                                  </div>
                                </div>

                                {/* Customer Info */}
                                <div className="bg-white rounded-xl p-5 border border-gray-100">
                                  <h3 className="text-[12px] font-black text-gray-500 uppercase tracking-wider mb-4">Customer Information</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-[10px] text-gray-400">Full Name</p>
                                      <p className="font-semibold text-gray-800">{details.customer.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400">Email</p>
                                      <p className="font-semibold text-gray-800">{details.customer.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400">Phone</p>
                                      <p className="font-semibold text-gray-800">{details.customer.phone || "—"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400">Role</p>
                                      <p className="font-semibold text-gray-800">{details.customer.role}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400">Address</p>
                                      <p className="font-semibold text-gray-800">{details.customer.address || "—"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400">City / Emirate</p>
                                      <p className="font-semibold text-gray-800">{details.customer.city || "—"} {details.customer.emirate ? `/ ${details.customer.emirate}` : ""}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400">Member Since</p>
                                      <p className="font-semibold text-gray-800">{formatDate(details.customer.createdAt)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                                    <button
                                      onClick={() => setEditingCustomer(details.customer)}
                                      className="flex-1 py-2 rounded-xl bg-[#004b9c] text-white text-[12px] font-bold hover:bg-[#003d82] transition-colors"
                                    >
                                      Edit Customer
                                    </button>
                                    <button
                                      onClick={() => {
                                        window.location.href = `mailto:${details.customer.email}`;
                                      }}
                                      className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 text-[12px] font-bold hover:bg-gray-50 transition-colors"
                                    >
                                      Send Email
                                    </button>
                                  </div>
                                </div>

                                {/* Recent Orders */}
                                {details.orders && details.orders.length > 0 && (
                                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                                    <h3 className="text-[12px] font-black text-gray-500 uppercase tracking-wider mb-3">Recent Orders</h3>
                                    <div className="space-y-2">
                                      {details.orders.slice(0, 5).map((order: any) => (
                                        <Link
                                          key={order._id}
                                          href={`/admin/orders`}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                          <div>
                                            <p className="font-bold text-[#004b9c] text-[12px]">{order.orderNumber}</p>
                                            <p className="text-[10px] text-gray-400">{formatDate(order.createdAt)}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-bold text-gray-800 text-[13px]">{formatCurrency(order.totalAmount)}</p>
                                            <p className="text-[10px] text-gray-400">{order.status}</p>
                                          </div>
                                        </Link>
                                      ))}
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
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-[13px] text-gray-500 font-semibold">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {editingCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCustomer(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50"
            >
              <div className="p-6">
                <h2 className="text-[16px] font-black text-gray-900 mb-4">Edit Customer</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingCustomer.phone || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Role</label>
                    <select
                      value={editingCustomer.role}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, role: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Address</label>
                    <input
                      type="text"
                      value={editingCustomer.address || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">City</label>
                      <input
                        type="text"
                        value={editingCustomer.city || ""}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Emirate</label>
                      <input
                        type="text"
                        value={editingCustomer.emirate || ""}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, emirate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#004b9c]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingCustomer(null)}
                    className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateCustomer}
                    disabled={updating}
                    className="flex-1 py-2 rounded-xl bg-[#004b9c] text-white font-semibold text-[13px] hover:bg-[#003d82] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
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