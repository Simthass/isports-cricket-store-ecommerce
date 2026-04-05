// src/models/Category.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Clear the model cache to ensure fresh registration
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  CategorySchema,
);

export default Category;
