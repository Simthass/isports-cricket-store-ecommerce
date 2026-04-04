import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in .env");
}

// ── Schemas ──────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    password: String,
    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    emailVerified: Date,
    image: String,
  },
  { timestamps: true },
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: String,
  },
  { timestamps: true },
);

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logo: String,
  },
  { timestamps: true },
);

// ── Models ───────────────────────────────────────────────────
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

// ── Seed Data ────────────────────────────────────────────────
const categories = [
  { name: "Bats", slug: "bats" },
  { name: "Balls", slug: "balls" },
  { name: "Helmets", slug: "helmets" },
  { name: "Clothing & Jersey", slug: "clothing" },
  { name: "Shoes", slug: "shoes" },
  { name: "Backpacks", slug: "backpacks" },
  { name: "Accessories", slug: "accessories" },
];

const brands = [
  { name: "Gray-Nicolls", slug: "gray-nicolls" },
  { name: "SS", slug: "ss" },
  { name: "SG", slug: "sg" },
  { name: "Kookaburra", slug: "kookaburra" },
  { name: "GM", slug: "gm" },
  { name: "Spartan", slug: "spartan" },
  { name: "Adidas", slug: "adidas" },
  { name: "New Balance", slug: "new-balance" },
  { name: "Puma", slug: "puma" },
  { name: "MRF", slug: "mrf" },
  { name: "DSC", slug: "dsc" },
  { name: "CEAT", slug: "ceat" },
  { name: "BDM", slug: "bdm" },
  { name: "CA Sports", slug: "ca-sports" },
  { name: "Shrey", slug: "shrey" },
];

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // ── Admin User ──────────────────────────────
  console.log("\n👤 Seeding admin user...");
  const hashedPassword = await bcrypt.hash(
    "!SpOrtS@26uAEPaS$w0rDAdM1N2O26",
    12,
  );

  const existingAdmin = await User.findOne({ email: "simthass@outlook.com" });

  if (existingAdmin) {
    await User.updateOne(
      { email: "simthass@outlook.com" },
      {
        $set: {
          password: hashedPassword,
          role: "ADMIN",
          name: "iSports Admin",
        },
      },
    );
    console.log("✅ Admin user updated: simthass@outlook.com");
  } else {
    await User.create({
      email: "simthass@outlook.com",
      name: "iSports Admin",
      password: hashedPassword,
      role: "ADMIN",
    });
    console.log("✅ Admin user created: simthass@outlook.com");
  }

  // ── Categories ──────────────────────────────
  console.log("\n📂 Seeding categories...");
  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true, new: true },
    );
    console.log(`  ✓ ${cat.name}`);
  }
  console.log("✅ Categories seeded");

  // ── Brands ──────────────────────────────────
  console.log("\n🏷️  Seeding brands...");
  for (const brand of brands) {
    await Brand.findOneAndUpdate(
      { slug: brand.slug },
      { $set: brand },
      { upsert: true, new: true },
    );
    console.log(`  ✓ ${brand.name}`);
  }
  console.log("✅ Brands seeded");

  console.log("\n🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  });
