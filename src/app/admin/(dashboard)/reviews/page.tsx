"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, CheckCircle, XCircle, MessageCircle, Eye,
  Loader2, Search, Filter, ChevronDown, ChevronUp, Trash2,
} from "lucide-react";

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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
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
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const filteredReviews = reviews.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    r.userId.name.toLowerCase().includes(search.toLowerCase()) ||
    r.productId.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    approved: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">Review Management</h1>
            <p className="text-gray-400 text-[13px] mt-1">Manage customer reviews and feedback</p>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-100"
          >
            <Loader2 size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  filterStatus === status
                    ? "bg-[#004b9c] text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span className="ml-1 text-[10px]">
                    ({reviews.filter(r => r.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] w-64 focus:outline-none focus:border-[#004b9c]"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#004b9c]" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Review Header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-gray-600">
                          {review.userId.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{review.userId.name}</p>
                        <p className="text-[11px] text-gray-400">{review.userId.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[review.status]}`}>
                        {review.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mt-4">
                    <Link href={`/shop/product/${review.productId.slug}`}>
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={review.productId.images?.[0] || "/placeholder-product.jpg"}
                          alt={review.productId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link href={`/shop/product/${review.productId.slug}`}>
                        <p className="font-semibold text-gray-800 hover:text-[#004b9c] text-[14px]">
                          {review.productId.name}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= review.rating ? "#ffd700" : "#e2e8f0"}
                              className={star <= review.rating ? "text-amber-400" : "text-gray-200"}
                            />
                          ))}
                        </div>
                        {review.verifiedPurchase && (
                          <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 text-[13px] mt-2">{review.title}</p>
                      <p className="text-gray-500 text-[12px] mt-1">{review.comment}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(review._id, "approved")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[11px] font-semibold hover:bg-green-100"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(review._id, "rejected")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold hover:bg-blue-100"
                    >
                      <MessageCircle size={12} /> Reply
                    </button>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-[11px] font-semibold hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === review._id ? null : review._id)}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#004b9c]"
                    >
                      {expandedId === review._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Details
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === review._id && (
                  <div className="p-5 bg-gray-50">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Details</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Review" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-gray-500">Helpful: {review.helpful} users found this helpful</p>
                    {review.adminReply && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Admin Response</p>
                        <p className="text-[12px] text-gray-700 mt-1">{review.adminReply.comment}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(review.adminReply.createdAt)}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Reply to Review</h3>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] text-gray-500">Review by {selectedReview.userId.name}</p>
              <p className="text-[13px] text-gray-700 mt-1">"{selectedReview.comment}"</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#004b9c]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedReview(null)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => submitReply(selectedReview._id)}
                disabled={submitting || !replyText.trim()}
                className="flex-1 py-2 rounded-xl bg-[#004b9c] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}