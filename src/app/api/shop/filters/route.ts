// src/app/api/shop/filters/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    await connectDB();

    const [categories, brands] = await Promise.all([
      Category.find({}).sort({ name: 1 }).lean(),
      Brand.find({}).sort({ name: 1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((c) => ({ value: c.slug, label: c.name })),
        brands: brands.map((b) => ({ value: b.slug, label: b.name })),
      },
    });
  } catch (error) {
    console.error("[GET /api/shop/filters]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch filters" },
      { status: 500 },
    );
  }
}
