// src/models/Order.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "PAID";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  emirate?: string;
  paymentMethod: string;
  paymentIntentId?: string;
  orderSource: string;
  waMessageId?: string;
  whatsappOrderId?: mongoose.Types.ObjectId; // ✅ ADD THIS FIELD
  status: OrderStatus;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  couponApplied?: boolean;
  deliveryMethod?: string;
  notes?: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    brand: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "Standard" },
    image: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    city: { type: String, required: true },
    emirate: { type: String, default: "" },
    paymentMethod: { type: String, required: true },
    paymentIntentId: { type: String },
    orderSource: { type: String, default: "web" },
    waMessageId: { type: String },
    whatsappOrderId: { type: Schema.Types.ObjectId, ref: "WhatsAppOrder" }, // ✅ ADD THIS
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "PAID",
      ],
      default: "PENDING",
    },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    couponApplied: { type: Boolean, default: false },
    deliveryMethod: { type: String, default: "standard" },
    notes: { type: String },
    items: { type: [OrderItemSchema], default: [] },
  },
  { timestamps: true },
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
