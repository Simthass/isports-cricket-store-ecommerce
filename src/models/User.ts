import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  smsAlerts: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "CUSTOMER" | "ADMIN";
  emailVerified?: Date;
  image?: string;
  address: string;
  city: string;
  emirate: string;
  notificationPreferences: INotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema(
  {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    newArrivals: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6 },
    phone: { type: String, default: "", trim: true },
    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    emailVerified: { type: Date },
    image: { type: String },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    emirate: { type: String, default: "" },
    notificationPreferences: {
      type: NotificationPreferencesSchema,
      default: {
        orderUpdates: true,
        promotions: false,
        newArrivals: true,
        smsAlerts: false,
      },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;