// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

// Validation schema for creating a product
const CreateProductSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  description: z.string().max(5000).optional().or(z.literal("")),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional().nullable(),
  images: z.array(z.string().url()).min(1).max(10),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  stockQty: z.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sizes: z.array(z.string().trim()).default([]),
  colors: z.array(z.string().trim()).default([]),
});

// ── GET /api/products ────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const inStock = searchParams.get("inStock");
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (inStock === "true") filter.inStock = true;
    if (inStock === "false") filter.inStock = false;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
      filter.brandId = new mongoose.Types.ObjectId(brandId);
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// ── POST /api/products ───────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await req.json();
    console.log("Received body:", body);

    // Validate input
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Validation errors:", parsed.error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Generate slug
    let slug = slugify(data.name, { lower: true, strict: true, trim: true });
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create product
    const product = await Product.create({
      ...data,
      slug,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      brandId: new mongoose.Types.ObjectId(data.brandId),
      rating: 0,
      reviewCount: 0,
    });

    // Populate references
    const populatedProduct = await Product.findById(product._id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();

    return NextResponse.json(
      { success: true, data: populatedProduct },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/products] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
