import mongoose, { Schema, Document, Model } from "mongoose";

// ── Size with individual price ────────────────────────────────
export interface ISizeOption {
  label: string; // e.g. "Short Handle", "SH", "6"
  price: number; // price for this size
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  price: number; // base / default price
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQty: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  // Sizes — stored as objects when price-per-size is enabled
  sizes: string[]; // kept for backward compat (simple labels)
  sizeOptions: ISizeOption[]; // rich size+price objects (use this when enableSizePrice = true)
  enableSizePrice: boolean; // if true, use sizeOptions instead of sizes
  colors: string[];
  categoryId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SizeOptionSchema = new Schema<ISizeOption>(
  {
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    stockQty: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    sizes: { type: [String], default: [] },
    sizeOptions: { type: [SizeOptionSchema], default: [] },
    enableSizePrice: { type: Boolean, default: false },
    colors: { type: [String], default: [] },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  },
  { timestamps: true },
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
