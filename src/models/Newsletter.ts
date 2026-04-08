// src/models/Newsletter.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "homepage",
    },
  },
  {
    timestamps: true,
  },
);

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter ||
  mongoose.model<INewsletter>("Newsletter", NewsletterSchema);

export default Newsletter;
