// models/User.ts
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
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: "CUSTOMER" | "ADMIN";
  emailVerified?: Date;
  image?: string;
  address: string;
  city: string;
  emirate: string;
  /** Notification preferences (supports both field names for compatibility) */
  notificationSettings?: INotificationSettings;
  notificationPreferences?: INotificationSettings;
  createdAt: Date;
  updatedAt: Date;
  // Session tracking for single device
  currentSessionToken?: string;
  lastActiveAt?: Date;
}

// ── Notification Settings Schema ──────────────────────────────────────────────
const NotificationSettingsSchema = new Schema<INotificationSettings>(
  {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    newArrivals: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
  },
  { _id: false },
);

// ── Main User Schema ──────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    // Primary name field - single source of truth
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    
    // Legacy fields kept for backward-compatibility
    firstName: { 
      type: String, 
      default: "", 
      trim: true 
    },
    lastName: { 
      type: String, 
      default: "", 
      trim: true 
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      // Exclude from default queries so it is never accidentally leaked
      select: false,
    },
    
    phone: { 
      type: String, 
      default: "", 
      trim: true 
    },
    
    role: { 
      type: String, 
      enum: ["CUSTOMER", "ADMIN"], 
      default: "CUSTOMER" 
    },
    
    emailVerified: { 
      type: Date 
    },
    
    image: { 
      type: String 
    },
    
    address: { 
      type: String, 
      default: "" 
    },
    
    city: { 
      type: String, 
      default: "" 
    },
    
    emirate: { 
      type: String, 
      default: "" 
    },
    
    // Support both field names for backward compatibility
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({
        orderUpdates: true,
        promotions: false,
        newArrivals: true,
        smsAlerts: false,
      }),
    },
    
    notificationPreferences: {
      type: NotificationSettingsSchema,
      default: () => ({
        orderUpdates: true,
        promotions: false,
        newArrivals: true,
        smsAlerts: false,
      }),
    },
    
    // Session tracking for single device login
    currentSessionToken: { 
      type: String, 
      default: null,
      index: true,
    },
    
    lastActiveAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: true 
  },
);

// ── Indexes for better query performance ──────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ currentSessionToken: 1 });

// ── Pre-save hook: keep legacy firstName/lastName in sync ─────────────────────
UserSchema.pre("save", function (next) {
  // If someone still passes firstName/lastName, keep `name` consistent
  if (
    (this.isModified("firstName") || this.isModified("lastName")) &&
    !this.isModified("name")
  ) {
    const fn = this.firstName?.trim() ?? "";
    const ln = this.lastName?.trim() ?? "";
    this.name = `${fn} ${ln}`.trim() || this.name;
  }
  
  // Sync notificationSettings with notificationPreferences if needed
  if (this.isModified("notificationSettings") && !this.isModified("notificationPreferences")) {
    this.notificationPreferences = this.notificationSettings;
  }
  if (this.isModified("notificationPreferences") && !this.isModified("notificationSettings")) {
    this.notificationSettings = this.notificationPreferences;
  }
  
  // Update lastActiveAt on save if not already set
  if (!this.lastActiveAt) {
    this.lastActiveAt = new Date();
  }
  
  next();
});

// ── Pre-update hook to maintain sync ─────────────────────────────────────────
UserSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;
  
  // Ensure notification fields stay in sync
  if (update.notificationSettings && !update.notificationPreferences) {
    update.notificationPreferences = update.notificationSettings;
  }
  if (update.notificationPreferences && !update.notificationSettings) {
    update.notificationSettings = update.notificationPreferences;
  }
  
  next();
});

// ── Virtual for getting active notification preferences ───────────────────────
UserSchema.virtual("activeNotificationSettings").get(function() {
  // Return notificationSettings if it exists, otherwise notificationPreferences
  return this.notificationSettings || this.notificationPreferences || {
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    smsAlerts: false,
  };
});

// ── Method to update last active timestamp ────────────────────────────────────
UserSchema.methods.updateLastActive = async function() {
  this.lastActiveAt = new Date();
  return this.save();
};

// ── Method to clear session token (logout from all devices) ───────────────────
UserSchema.methods.clearSessionToken = async function() {
  this.currentSessionToken = null;
  return this.save();
};

// ── Ensure virtuals are included in JSON output ───────────────────────────────
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

// ── Model ─────────────────────────────────────────────────────────────────────
const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;