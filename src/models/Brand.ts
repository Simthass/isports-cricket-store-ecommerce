// src/models/Brand.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  createdAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logo: { type: String },
    country: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Clear the model cache to ensure fresh registration
if (mongoose.models.Brand) {
  delete mongoose.models.Brand;
}

const Brand: Model<IBrand> = mongoose.model<IBrand>("Brand", BrandSchema);

export default Brand;
