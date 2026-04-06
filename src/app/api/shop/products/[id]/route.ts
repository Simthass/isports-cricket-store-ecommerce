// src/app/api/shop/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 },
      );
    }

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

    const relatedProducts = await Product.find({
      categoryId: (product as any).categoryId,
      _id: { $ne: product._id },
      inStock: true,
    })
      .limit(4)
      .populate("brandId", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: { product, relatedProducts },
    });
  } catch (error) {
    console.error("[GET /api/shop/products/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}