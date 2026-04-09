import mongoose, { Schema, Document, Model } from "mongoose";

// ── Notification preferences sub-document ────────────────────────────────────
export interface INotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  smsAlerts: boolean;
}

// ── Main User interface ───────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  /** Full display name — the single source of truth for the user's name. */
  name: string;
  /** Legacy fields kept for backward-compatibility with older data. */
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  role: "CUSTOMER" | "ADMIN";
  emailVerified?: Date;
  image?: string;
  address?: string;
  city?: string;
  emirate?: string;
  notificationSettings?: INotificationSettings;
  createdAt: Date;
  updatedAt: Date;
  // Session tracking for single device
  currentSessionToken?: string;
  lastActiveAt?: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────
const NotificationSettingsSchema = new Schema<INotificationSettings>(
  {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    newArrivals: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: { type: String, default: "", trim: true },
    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    emailVerified: { type: Date },
    image: { type: String },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    emirate: { type: String, default: "" },
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({}),
    },
    // Session tracking
    currentSessionToken: { type: String, default: null },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UserSchema.pre("save", function (next) {
  if (
    (this.isModified("firstName") || this.isModified("lastName")) &&
    !this.isModified("name")
  ) {
    const fn = this.firstName?.trim() ?? "";
    const ln = this.lastName?.trim() ?? "";
    this.name = `${fn} ${ln}`.trim() || this.name;
  }
  next();
});

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
