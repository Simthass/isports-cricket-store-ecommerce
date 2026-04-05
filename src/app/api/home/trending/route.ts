// src/app/api/home/trending/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    // Ensure models are registered
    await import("@/models/Category");
    await import("@/models/Brand");

    const trendingProducts = await Product.find({
      isTrending: true,
      inStock: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10)
      .lean();

    console.log(`Found ${trendingProducts.length} trending products`); // Debug log

    return NextResponse.json({ success: true, data: trendingProducts });
  } catch (error) {
    console.error("[GET /api/home/trending]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending products" },
      { status: 500 },
    );
  }
}
