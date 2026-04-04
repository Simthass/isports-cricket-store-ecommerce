import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

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
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sizes: z.array(z.string().trim()).optional(),
  colors: z.array(z.string().trim()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/products/[id] ────────────────────────────────────
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 },
      );
    }
    await connectDB();
    const product = await Product.findById(id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// ── PUT /api/products/[id] ────────────────────────────────────
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 },
      );
    }

    const body: unknown = await req.json();
    const parsed = UpdateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.name) {
      let slug = slugify(parsed.data.name, { lower: true, strict: true });
      const existing = await Product.findOne({ slug, _id: { $ne: id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }

    if (parsed.data.originalPrice === null) {
      updateData.originalPrice = undefined;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/products/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/products/[id] ─────────────────────────────────
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 },
      );
    }

    await connectDB();
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("[DELETE /api/products/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
