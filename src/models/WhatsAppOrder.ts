import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWhatsAppOrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
}

export interface IWhatsAppOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: IWhatsAppOrderItem[];
  originalItems: IWhatsAppOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  status: "PENDING" | "WAITING_CONFIRMATION" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentMethod: string;
  deliveryAddress?: string;
  whatsappMessageId?: string;
  adminNotes?: string;
  customerNotes?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppOrderItemSchema = new Schema<IWhatsAppOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "Standard" },
    image: { type: String },
  },
  { _id: false }
);

const WhatsAppOrderSchema = new Schema<IWhatsAppOrder>(
  {
    orderNumber: { 
      type: String, 
      unique: true,
      default: function() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `WA-${timestamp}-${random}`;
      }
    },
    customerInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    items: { type: [WhatsAppOrderItemSchema], required: true },
    originalItems: { type: [WhatsAppOrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "WAITING_CONFIRMATION", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "WAITING_CONFIRMATION",
      index: true,
    },
    paymentMethod: { type: String, default: "cod" },
    deliveryAddress: { type: String },
    whatsappMessageId: { type: String },
    adminNotes: { type: String },
    customerNotes: { type: String },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { 
    timestamps: true,
    // Add this to ensure default functions run
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Remove the pre-save middleware since we're using default function
// Just keep this for any additional validation if needed
WhatsAppOrderSchema.pre("validate", function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `WA-${timestamp}-${random}`;
  }
  next();
});

const WhatsAppOrder: Model<IWhatsAppOrder> =
  mongoose.models.WhatsAppOrder || mongoose.model<IWhatsAppOrder>("WhatsAppOrder", WhatsAppOrderSchema);

export default WhatsAppOrder;