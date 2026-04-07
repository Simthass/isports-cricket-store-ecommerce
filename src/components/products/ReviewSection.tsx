"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp, User, Calendar, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ReviewForm from "./ReviewForm";

interface Review {
  _id: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
  adminReply?: {
    comment: string;
    createdAt: string;
  };
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
  initialRating?: number;
  initialReviewCount?: number;
}

export default function ReviewSection({ productId, productName, initialRating = 0, initialReviewCount = 0 }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [totalReviews, setTotalReviews] = useState(initialReviewCount);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [markingHelpful, setMarkingHelpful] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  // Check if user has purchased this product
  useEffect(() => {
    const checkPurchase = async () => {
      if (!session?.user) {
        setCanReview(false);
        setCheckingPurchase(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/check-purchase?productId=${productId}`);
        const data = await res.json();
        setCanReview(data.canReview);
      } catch (error) {
        console.error("Error checking purchase:", error);
        setCanReview(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchase();
  }, [session, productId]);

  const fetchReviews = async (reset = true) => {
    if (reset) setLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const params = new URLSearchParams({
        productId,
        page: String(currentPage),
        limit: "10",
        rating: filter,
        sort,
      });
      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        if (reset) {
          setReviews(data.reviews);
          setPage(1);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }
        setHasMore(data.reviews.length === 10);
        setAverageRating(data.ratingSummary.average);
        setTotalReviews(data.ratingSummary.count);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, [filter, sort, productId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(false);
  };

  const markHelpful = async (reviewId: string) => {
    if (!session?.user) return;
    setMarkingHelpful(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "helpful" }),
      });
      if (res.ok) {
        setReviews(prev =>
          prev.map(r => r._id === reviewId ? { ...r, helpful: r.helpful + 1 } : r)
        );
      }
    } catch (error) {
      console.error("Error marking helpful:", error);
    } finally {
      setMarkingHelpful(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div>
      {/* Review Summary Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= Math.floor(averageRating) ? "#ffd700" : "#e2e8f0"}
                  className={star <= Math.floor(averageRating) ? "text-amber-400" : "text-gray-200"}
                />
              ))}
            </div>
            <span className="text-[20px] font-black text-gray-900">{averageRating.toFixed(1)}</span>
            <span className="text-gray-400 text-[13px]">({totalReviews} reviews)</span>
          </div>
        </div>
        
        {session?.user && (
          <button
            onClick={() => setShowForm(true)}
            disabled={!canReview}
            className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
              canReview 
                ? "bg-[#004b9c] text-white hover:bg-[#003d82]" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title={!canReview ? "You can only review products you have purchased" : ""}
          >
            Write a Review
            {!canReview && checkingPurchase && <Loader2 size={12} className="inline ml-2 animate-spin" />}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === "all" ? "bg-[#004b9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("5")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === "5" ? "bg-[#004b9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            5 ★
          </button>
          <button
            onClick={() => setFilter("4")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === "4" ? "bg-[#004b9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            4 ★
          </button>
          <button
            onClick={() => setFilter("3")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === "3" ? "bg-[#004b9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            3 ★
          </button>
          <button
            onClick={() => setFilter("2")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === "2" ? "bg-[#004b9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            2 ★
          </button>
          <button
            onClick={() => setFilter("1")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === "1" ? "bg-[#004b9c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            1 ★
          </button>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 bg-white focus:outline-none focus:border-[#004b9c]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#004b9c]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <MessageSquare size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No reviews yet</p>
          {session?.user && canReview && (
            <button onClick={() => setShowForm(true)} className="mt-3 text-[#004b9c] text-[13px] font-semibold hover:underline">
              Be the first to review this product!
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={18} className="text-[#004b9c]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{review.userName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
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
                        <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Calendar size={12} />
                  {formatDate(review.createdAt)}
                </div>
              </div>

              <h4 className="font-bold text-gray-800 text-[15px] mt-2 mb-2">{review.title}</h4>
              <p className="text-gray-600 text-[13px] leading-relaxed">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden">
                      <img src={img} alt="Review" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Admin Response</p>
                  <p className="text-[13px] text-gray-700">{review.adminReply.comment}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(review.adminReply.createdAt)}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                <button
                  onClick={() => markHelpful(review._id)}
                  disabled={!session?.user || markingHelpful === review._id}
                  className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-[#004b9c] transition-colors disabled:opacity-50"
                >
                  <ThumbsUp size={12} />
                  Helpful ({review.helpful})
                </button>
              </div>
            </motion.div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Load More Reviews
            </button>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        productId={productId}
        productName={productName}
        onSuccess={() => {
          setShowForm(false);
          fetchReviews(true);
        }}
      />
    </div>
  );
}