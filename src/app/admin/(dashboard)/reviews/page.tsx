"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle,
  XCircle,
  MessageCircle,
  Eye,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
  X,
  Send,
  User,
  Package,
  Calendar,
  ThumbsUp,
  Reply,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  productId: { _id: string; name: string; slug: string; images: string[] };
  userId: { _id: string; name: string; email: string };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  helpful: number;
  status: "pending" | "approved" | "rejected";
  adminReply: { comment: string; createdAt: string } | null;
  createdAt: string;
}

// ── Stats Card Component ──────────────────────────────────────
function StatsCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: number;
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

// ── Status Badge Component ────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
    },
    approved: {
      icon: CheckCircle2,
      label: "Approved",
      color: "from-green-500 to-emerald-500",
      bgLight: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      color: "from-red-500 to-rose-500",
      bgLight: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    },
  };
  const c = config[status as keyof typeof config] || config.pending;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${c.bgLight} ${c.textColor} border ${c.borderColor}`}
    >
      <Icon size={10} />
      {c.label}
    </span>
  );
}

// ── Rating Stars Component ────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          fill={star <= rating ? "#fbbf24" : "#e5e7eb"}
          className={star <= rating ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

// ── Toast Component ───────────────────────────────────────────
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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const updateStatus = async (reviewId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReviews();
        showToast(`Review ${status} successfully`, "success");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: { comment: replyText } }),
      });
      if (res.ok) {
        setReplyText("");
        setSelectedReview(null);
        fetchReviews();
        showToast("Reply sent successfully", "success");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      showToast("Failed to send reply", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        fetchReviews();
        showToast("Review deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast("Failed to delete review", "error");
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.userId.name.toLowerCase().includes(search.toLowerCase()) ||
      r.productId.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    avgRating:
      reviews
        .filter((r) => r.status === "approved")
        .reduce((acc, r) => acc + r.rating, 0) /
      (reviews.filter((r) => r.status === "approved").length || 1),
  };

  const statusFilters = [
    {
      value: "all",
      label: "All Reviews",
      icon: MessageCircle,
      count: stats.total,
    },
    {
      value: "pending",
      label: "Pending",
      icon: Clock,
      count: stats.pending,
      color: "from-amber-500 to-orange-500",
    },
    {
      value: "approved",
      label: "Approved",
      icon: CheckCircle2,
      count: stats.approved,
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "rejected",
      label: "Rejected",
      icon: XCircle,
      count: stats.rejected,
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
                  Customer Feedback
                </span>
              </div>
              <h1 className="text-[28px] font-black tracking-tight">
                Review Management
              </h1>
              <p className="text-blue-100 text-[13px] mt-1">
                Manage customer reviews and feedback for your products
              </p>
            </div>
            <button
              onClick={fetchReviews}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white text-[13px] font-bold hover:bg-white/20 transition-all"
            >
              <Loader2 size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard
            title="Total Reviews"
            value={stats.total}
            icon={<MessageCircle size={18} className="text-white" />}
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
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 size={18} className="text-white" />}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle size={18} className="text-white" />}
            color="from-red-500 to-rose-500"
          />
          <StatsCard
            title="Avg. Rating"
            value={stats.avgRating.toFixed(1)}
            icon={<Star size={18} className="text-white" />}
            color="from-amber-500 to-yellow-500"
          />
        </div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews by customer, product, or comment..."
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
            <div className="flex gap-2">
              {statusFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = filterStatus === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      isActive
                        ? filter.value === "all"
                          ? "bg-[#004b9c] text-white shadow-md"
                          : `bg-gradient-to-r ${filter.color} text-white shadow-md`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon size={12} />
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

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-48" />
                    <div className="h-16 bg-gray-100 rounded mt-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-gray-400" />
            </div>
            <p className="text-[16px] font-bold text-gray-700 mb-1">
              {search ? "No reviews match your search" : "No reviews yet"}
            </p>
            <p className="text-[13px] text-gray-400 mb-5 max-w-sm">
              {search
                ? "Try a different keyword or clear the search filter"
                : "Customer reviews will appear here once submitted"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-bold"
              >
                <Filter size={14} /> Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Review Header */}
                    <div className="p-5 border-b border-gray-50">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004b9c] to-[#0062cc] flex items-center justify-center text-white font-bold shadow-md">
                            {review.userId.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {review.userId.name}
                            </p>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <User size={10} /> {review.userId.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={review.status} />
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Calendar size={10} />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Link
                          href={`/shop/product/${review.productId.slug}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden border border-gray-100 shadow-sm">
                            <img
                              src={
                                review.productId.images?.[0] ||
                                "/placeholder-product.jpg"
                              }
                              alt={review.productId.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1">
                          <Link href={`/shop/product/${review.productId.slug}`}>
                            <p className="font-semibold text-gray-800 hover:text-[#004b9c] text-[14px] transition-colors flex items-center gap-1.5">
                              <Package size={12} className="text-gray-400" />
                              {review.productId.name}
                            </p>
                          </Link>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <RatingStars rating={review.rating} />
                            {review.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <ShieldCheck size={10} /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-gray-800 text-[13px] mt-2">
                            {review.title}
                          </p>
                          <p className="text-gray-500 text-[12px] mt-1 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 flex-wrap">
                        {review.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(review._id, "approved")
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[11px] font-semibold hover:bg-green-100 transition-all"
                            >
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(review._id, "rejected")
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-all"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-semibold hover:bg-blue-100 transition-all"
                        >
                          <Reply size={12} /> Reply
                        </button>
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 text-[11px] font-semibold hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === review._id ? null : review._id,
                            )
                          }
                          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#004b9c] ml-auto transition-colors"
                        >
                          {expandedId === review._id ? (
                            <>
                              <ChevronUp size={14} /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} /> Show Details
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === review._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-5 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100"
                        >
                          <div className="space-y-3">
                            {review.images && review.images.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  Customer Images
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  {review.images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`Review ${idx + 1}`}
                                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <ThumbsUp size={12} className="text-gray-400" />
                              <p className="text-[11px] text-gray-500">
                                {review.helpful} users found this review helpful
                              </p>
                            </div>
                            {review.adminReply && (
                              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                                  <Reply size={10} /> Admin Response
                                </p>
                                <p className="text-[12px] text-gray-700 mt-1.5 leading-relaxed">
                                  {review.adminReply.comment}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                  {formatDate(review.adminReply.createdAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Result count */}
            <div className="flex justify-between items-center text-[12px] text-gray-400 pt-2">
              <p>
                Showing {filteredReviews.length} of {reviews.length} reviews
              </p>
            </div>
          </>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedReview(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#004b9c] to-[#0062cc] px-6 py-4">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Reply size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white">
                        Reply to Review
                      </h3>
                      <p className="text-[10px] text-blue-100">
                        Respond to customer feedback
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Review Preview */}
                <div className="mb-5 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#004b9c] to-[#0062cc] flex items-center justify-center text-white text-[10px] font-bold">
                      {selectedReview.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[12px] font-semibold text-gray-800">
                      {selectedReview.userId.name}
                    </p>
                    <RatingStars rating={selectedReview.rating} />
                  </div>
                  <p className="text-[13px] text-gray-600 italic leading-relaxed">
                    "{selectedReview.comment}"
                  </p>
                </div>

                {/* Reply Input */}
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to this customer..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-[13px] hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitReply(selectedReview._id)}
                    disabled={submitting || !replyText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#004b9c] to-[#0062cc] text-white font-semibold text-[13px] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {submitting ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
