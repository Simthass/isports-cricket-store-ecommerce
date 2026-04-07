"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export default function ReviewForm({ isOpen, onClose, productId, productName, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setImages([...images, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("Please login to submit a review");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter your review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload images first if any
      let uploadedImages: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append("images", img));
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImages = uploadData.urls;
        }
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
          images: uploadedImages,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-black text-gray-900">Write a Review</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">{productName}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Rating */}
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={28}
                        fill={(hoverRating || rating) >= star ? "#ffd700" : "#e2e8f0"}
                        className={(hoverRating || rating) >= star ? "text-amber-400" : "text-gray-200"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Review Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Your Review *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product?"
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Add Photos (Optional)</label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#004b9c] transition-colors">
                      <ImageIcon size={20} className="text-gray-400" />
                      <span className="text-[9px] text-gray-400 mt-1">Upload</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Maximum 5 images. JPG, PNG or GIF.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#004b9c] text-white font-semibold hover:bg-[#003d82] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}