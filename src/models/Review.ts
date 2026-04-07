import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  helpful: number;
  helpfulUsers: mongoose.Types.ObjectId[];
  status: "pending" | "approved" | "rejected";
  adminReply: {
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdminReplySchema = new Schema(
  {
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    images: { type: [String], default: [] },
    verifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    helpfulUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminReply: { type: AdminReplySchema, default: null },
  },
  { timestamps: true }
);

// Compound index for unique review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;