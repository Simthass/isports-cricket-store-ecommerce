"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Trash2, MessageCircle, Package, Loader2, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserReview {
  _id: string;
  productId: { _id: string; name: string; slug: string; images: string[] };
  rating: number;
  title: string;
  comment: string;
  status: string;
  createdAt: string;
  adminReply?: { comment: string; createdAt: string };
}

export default function MyReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      fetchReviews();
    }
  }, [session, status]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/user/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Back Button */}
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#004b9c] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Account
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">My Reviews</h1>
          <p className="text-gray-400 text-[13px] mt-1">Manage your product reviews</p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No reviews yet</p>
            <p className="text-gray-400 text-[13px] mt-1">Go to your orders and review purchased products</p>
            <Link href="/shop" className="inline-block mt-4 px-6 py-2.5 bg-[#004b9c] text-white rounded-xl text-[13px] font-bold">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex gap-4">
                    <Link href={`/shop/product/${review.productId.slug}`}>
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                        <img
                          src={review.productId.images?.[0] || "/placeholder-product.jpg"}
                          alt={review.productId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div>
                      <Link href={`/shop/product/${review.productId.slug}`}>
                        <h3 className="font-bold text-gray-800 hover:text-[#004b9c] transition-colors">
                          {review.productId.name}
                        </h3>
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
                        <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-[13px] mt-2">{review.title}</p>
                      <p className="text-gray-500 text-[12px] mt-1">{review.comment}</p>
                      {review.adminReply && (
                        <div className="mt-3 bg-blue-50 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">Admin Response</p>
                          <p className="text-[12px] text-gray-700">{review.adminReply.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReview(review._id)}
                    disabled={deletingId === review._id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {deletingId === review._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}