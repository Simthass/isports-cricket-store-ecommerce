// src/models/SubCategory.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  parentCategoryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    image: { type: String },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Unique slug per parent category
SubCategorySchema.index({ slug: 1, parentCategoryId: 1 }, { unique: true });

const SubCategory: Model<ISubCategory> =
  mongoose.models.SubCategory ||
  mongoose.model<ISubCategory>("SubCategory", SubCategorySchema);

export default SubCategory;
