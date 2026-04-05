import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWhatsAppLog extends Document {
  _id: mongoose.Types.ObjectId;
  to: string; // phone number  e.g. +971526514666
  customerName?: string;
  templateType:
    | "abandoned_cart"
    | "order_confirmation"
    | "review_request"
    | "manual";
  message: string;
  status: "sent" | "failed" | "pending" | "opted_out";
  orderId?: string;
  productName?: string;
  twilioSid?: string;
  error?: string;
  sentAt: Date;
}

const WhatsAppLogSchema = new Schema<IWhatsAppLog>(
  {
    to: { type: String, required: true, trim: true },
    customerName: { type: String },
    templateType: {
      type: String,
      enum: [
        "abandoned_cart",
        "order_confirmation",
        "review_request",
        "manual",
      ],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "failed", "pending", "opted_out"],
      default: "pending",
    },
    orderId: { type: String },
    productName: { type: String },
    twilioSid: { type: String },
    error: { type: String },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

// Index for fast querying
WhatsAppLogSchema.index({ to: 1 });
WhatsAppLogSchema.index({ sentAt: -1 });
WhatsAppLogSchema.index({ status: 1 });

const WhatsAppLog: Model<IWhatsAppLog> =
  mongoose.models.WhatsAppLog ||
  mongoose.model<IWhatsAppLog>("WhatsAppLog", WhatsAppLogSchema);

export default WhatsAppLog;
