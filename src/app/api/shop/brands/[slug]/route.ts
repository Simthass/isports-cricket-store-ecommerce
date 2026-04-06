// src/app/api/shop/brands/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { slug } = await context.params;

    const brand = await Brand.findOne({ slug }).lean();

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("[GET /api/shop/brands/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}
