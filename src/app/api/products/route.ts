// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import {
  generateQrCodeId,
  generateQrCodeDataUrl,
  buildProductQrUrl,
} from "@/lib/qrcode";

const SizeOptionSchema = z.object({
  label: z.string().min(1).trim(),
  price: z.number().min(0),
});

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
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isHeroProduct: z.boolean().default(false),
  heroOrder: z.number().int().min(0).max(3).default(0),
  sizes: z.array(z.string().trim()).default([]),
  sizeOptions: z.array(SizeOptionSchema).default([]),
  enableSizePrice: z.boolean().default(false),
  colors: z.array(z.string().trim()).default([]),
});

// ── GET /api/products ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await import("@/models/Category");
    await import("@/models/Brand");

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const search = searchParams.get("search") ?? "";
    const categoryId = searchParams.get("categoryId") ?? "";
    const brandId = searchParams.get("brandId") ?? "";
    const inStock = searchParams.get("inStock");

    const query: Record<string, unknown> = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId))
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (brandId && mongoose.Types.ObjectId.isValid(brandId))
      query.brandId = new mongoose.Types.ObjectId(brandId);
    if (inStock === "true") query.inStock = true;
    if (inStock === "false") query.inStock = false;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug logo")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// ── POST /api/products ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body: unknown = await req.json();
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectDB();
    const { name, ...rest } = parsed.data;

    // ── Slug ────────────────────────────────────────────────────────────────
    let slug = slugify(name, { lower: true, strict: true });
    if (await Product.findOne({ slug })) slug = `${slug}-${Date.now()}`;

    const basePrice =
      rest.enableSizePrice && rest.sizeOptions.length > 0
        ? rest.sizeOptions[0].price
        : rest.price;

    const heroOrderValue = rest.isHeroProduct ? rest.heroOrder : 0;

    // ── Generate a unique QR code ID ────────────────────────────────────────
    let qrCodeId: string;
    let attempts = 0;
    do {
      qrCodeId = generateQrCodeId();
      const collision = await Product.findOne({ qrCodeId })
        .select("_id")
        .lean();
      if (!collision) break;
      attempts++;
    } while (attempts < 10);

    // Derive base URL from env (set NEXT_PUBLIC_BASE_URL in .env)
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://yourdomain.com";
    const qrUrl = buildProductQrUrl(baseUrl, qrCodeId!);
    // 500 px for DB storage — branded logo badge included, good for the admin panel preview
    const qrCode = await generateQrCodeDataUrl({ url: qrUrl, size: 500 });

    // ── Create the product ──────────────────────────────────────────────────
    const product = await Product.create({
      name,
      slug,
      ...rest,
      price: basePrice,
      heroOrder: heroOrderValue,
      categoryId: new mongoose.Types.ObjectId(rest.categoryId),
      brandId: new mongoose.Types.ObjectId(rest.brandId),
      rating: 0,
      reviewCount: 0,
      qrCodeId,
      qrCode,
      qrScans: 0,
    });

    const populated = await Product.findById(product._id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
