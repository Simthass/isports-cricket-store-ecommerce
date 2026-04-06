// src/app/api/shop/nav-data/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    await connectDB();

    const [categories, brands] = await Promise.all([
      Category.find({}).sort({ name: 1 }).select("name slug image").lean(),
      Brand.find({}).sort({ name: 1 }).select("name slug logo").lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: { categories, brands },
    });
  } catch (error) {
    console.error("[GET /api/shop/nav-data]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nav data" },
      { status: 500 },
    );
  }
}
