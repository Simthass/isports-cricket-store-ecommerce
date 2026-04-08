// src/app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

const SizeOptionSchema = z.object({
  label: z.string().min(1).trim(),
  price: z.number().min(0),
});

const UpdateProductSchema = z.object({
  name: z.string().min(2).max(120).trim().optional(),
  description: z.string().max(5000).optional().or(z.literal("")),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional().nullable(),
  images: z.array(z.string().url()).min(1).max(10).optional(),
  categoryId: z.string().min(1).optional(),
  brandId: z.string().min(1).optional(),
  stockQty: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isHeroProduct: z.boolean().optional(),
  heroOrder: z.number().int().min(0).max(3).optional(),
  sizes: z.array(z.string().trim()).optional(),
  sizeOptions: z.array(SizeOptionSchema).optional(),
  enableSizePrice: z.boolean().optional(),
  colors: z.array(z.string().trim()).optional(),
});

type RouteContext = { params: Promise<{ slug: string }> };

// ── GET /api/products/[slug] ─────────────────────────────────────────────────
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    await connectDB();
    await import("@/models/Category");
    await import("@/models/Brand");

    const product = await Product.findOne({ slug })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();

    if (!product)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// ── PUT /api/products/[slug] ─────────────────────────────────────────────────
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const { slug: urlSlug } = await context.params;
    await connectDB();

    const existingProduct = await Product.findOne({ slug: urlSlug });
    if (!existingProduct)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );

    const body = await req.json();
    const parsed = UpdateProductSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );

    const updateData: Record<string, any> = { ...parsed.data };

    // Re-slug only if the name changed
    if (parsed.data.name) {
      let newSlug = slugify(parsed.data.name, { lower: true, strict: true });
      const taken = await Product.findOne({
        slug: newSlug,
        _id: { $ne: existingProduct._id },
      });
      if (taken) newSlug = `${newSlug}-${Date.now()}`;
      updateData.slug = newSlug;
    }

    // NOTE: QR code is intentionally NOT updated here — the product's QR always
    // points to /qr/<qrCodeId> which then resolves the slug at scan time,
    // so renaming a product never breaks printed labels. ✅

    const updated = await Product.findByIdAndUpdate(
      existingProduct._id,
      updateData,
      { new: true },
    )
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/products/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/products/[slug] ──────────────────────────────────────────────
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const { slug } = await context.params;
    await connectDB();
    const deleted = await Product.findOneAndDelete({ slug }).lean();

    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 },
    );
  }
}
