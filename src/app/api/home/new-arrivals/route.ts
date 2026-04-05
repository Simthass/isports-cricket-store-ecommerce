// src/app/api/home/new-arrivals/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    await connectDB();

    // Ensure models are registered
    await import("@/models/Category");
    await import("@/models/Brand");

    const newArrivals = await Product.find({
      isNewArrival: true, // Changed from isNew
      inStock: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, data: newArrivals });
  } catch (error) {
    console.error("[GET /api/home/new-arrivals]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch new arrivals" },
      { status: 500 },
    );
  }
}
