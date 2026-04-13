// src/models/Category.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubCategory {
  name: string;
  slug: string;
}

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false },
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    image: { type: String },
    subCategories: { type: [SubCategorySchema], default: [] },
  },
  { timestamps: true },
);

// Delete cached model so the updated schema (with subCategories) takes effect.
// Safe in production — only re-registers if not already registered.
delete (mongoose.models as any).Category;

const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  CategorySchema,
);

export default Category;
