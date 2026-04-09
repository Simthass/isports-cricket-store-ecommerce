import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettings extends Document {
  // Basic Info
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  favicon: string;
  logo: string;
  logoDark?: string;

  // Contact Info
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;

  // Social Media
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImage: string;

  // Admin Settings
  sessionTimeoutHours: number; // 1, 2, 5, 24
  singleDeviceOnly: boolean; // true = only one device at a time

  // Timestamps
  updatedBy: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteTitle: {
      type: String,
      default: "iSPORTS Cricket | UAE's Premium Cricket Store",
    },
    siteDescription: {
      type: String,
      default:
        "Shop professional cricket gear in Sharjah, Ajman, and across UAE.",
    },
    siteKeywords: {
      type: [String],
      default: ["cricket", "sports", "UAE", "cricket equipment"],
    },
    favicon: { type: String, default: "/favicon.ico" },
    logo: { type: String, default: "/ISportsCricket-Logo.png" },
    logoDark: { type: String, default: "" },

    phone: { type: String, default: "+971 52 6514 666" },
    email: { type: String, default: "info@isportscricket.com" },
    address: { type: String, default: "Sharjah, UAE" },
    whatsappNumber: { type: String, default: "+971526514666" },

    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    tiktok: { type: String, default: "" },

    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },

    sessionTimeoutHours: { type: Number, default: 1, enum: [1, 2, 5, 24] },
    singleDeviceOnly: { type: Boolean, default: true },

    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default (mongoose.models.SiteSettings as Model<ISiteSettings>) ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
