import mongoose, { Schema, Document } from "mongoose";

export interface IWhatsAppTemplate extends Document {
  title: string;
  category: string;
  shortcut: string;
  messageEnglish: string; // ✅ Fixed: renamed from 'message'
  messageArabic: string | null;
  hasArabic: boolean;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppTemplateSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "abandoned_cart",
          "order_confirmation",
          "shipping",
          "review_request",
          "greeting",
          "payment",
          "product",
          "loyalty",
          "other",
        ],
        message: "{VALUE} is not a valid category",
      },
      default: "other",
      required: [true, "Category is required"],
    },
    shortcut: {
      type: String,
      default: "",
      trim: true,
      unique: true,
      sparse: true,
    },
    messageEnglish: {
      // ✅ Fixed: renamed from 'message'
      type: String,
      required: [true, "English message is required"],
      trim: true,
    },
    messageArabic: {
      type: String,
      trim: true,
      default: null,
    },
    hasArabic: {
      type: Boolean,
      default: false,
    },
    variables: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Auto-extract variables from message
WhatsAppTemplateSchema.pre("save", function (next) {
  const variablesSet = new Set<string>();

  // Extract from English message
  const englishMatches = this.messageEnglish.match(/\{([^}]+)\}/g) || [];
  englishMatches.forEach((match) => {
    variablesSet.add(match.replace(/[{}]/g, ""));
  });

  // Extract from Arabic message if exists
  if (this.messageArabic) {
    const arabicMatches = this.messageArabic.match(/\{([^}]+)\}/g) || [];
    arabicMatches.forEach((match) => {
      variablesSet.add(match.replace(/[{}]/g, ""));
    });
  }

  this.variables = Array.from(variablesSet);
  this.hasArabic = !!this.messageArabic && this.messageArabic.trim().length > 0;

  next();
});

// Also update on findByIdAndUpdate
WhatsAppTemplateSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;
  if (update.messageEnglish || update.messageArabic) {
    const variablesSet = new Set<string>();

    if (update.messageEnglish) {
      const matches = update.messageEnglish.match(/\{([^}]+)\}/g) || [];
      matches.forEach((match: string) => {
        variablesSet.add(match.replace(/[{}]/g, ""));
      });
    }

    if (update.messageArabic) {
      const matches = update.messageArabic.match(/\{([^}]+)\}/g) || [];
      matches.forEach((match: string) => {
        variablesSet.add(match.replace(/[{}]/g, ""));
      });
    }

    update.variables = Array.from(variablesSet);
    update.hasArabic = !!(
      update.messageArabic && update.messageArabic.trim().length > 0
    );
  }
  next();
});

export default mongoose.models.WhatsAppTemplate ||
  mongoose.model<IWhatsAppTemplate>("WhatsAppTemplate", WhatsAppTemplateSchema);
