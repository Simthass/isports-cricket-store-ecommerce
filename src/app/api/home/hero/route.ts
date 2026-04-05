// src/app/api/home/hero/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    // Ensure models are registered
    await import("@/models/Category");
    await import("@/models/Brand");

    const heroProducts = await Product.find({
      isHeroProduct: true,
      inStock: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort({ heroOrder: 1 })
      .limit(3)
      .lean();

    console.log(`Found ${heroProducts.length} hero products`); // Debug log

    return NextResponse.json({ success: true, data: heroProducts });
  } catch (error) {
    console.error("[GET /api/home/hero]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero products" },
      { status: 500 },
    );
  }
}
