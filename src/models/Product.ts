// src/models/Product.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISizeOption {
  label: string;
  price: number;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQty: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isHeroProduct: boolean;
  heroOrder: number;
  rating: number;
  reviewCount: number;
  sizes: string[];
  sizeOptions: ISizeOption[];
  enableSizePrice: boolean;
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
    isNewArrival: { type: Boolean, default: false }, // Changed from isNew
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isHeroProduct: { type: Boolean, default: false },
    heroOrder: { type: Number, default: 0 },
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
