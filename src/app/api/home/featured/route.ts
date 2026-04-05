// src/app/api/home/featured/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    // Ensure models are registered
    await import("@/models/Category");
    await import("@/models/Brand");

    const featuredProducts = await Product.find({
      isFeatured: true,
      inStock: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, data: featuredProducts });
  } catch (error) {
    console.error("[GET /api/home/featured]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured products" },
      { status: 500 },
    );
  }
}
