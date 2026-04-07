import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { slug } = await context.params;

    const product = await Product.findOne({ slug })
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
      categoryId: (product as any).categoryId?._id,
      slug: { $ne: slug }, // Use slug to exclude current product
      inStock: true,
    })
      .select("name slug price originalPrice images brandId")
      .limit(4)
      .populate("brandId", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: { product, relatedProducts },
    });
  } catch (error) {
    console.error("[GET /api/shop/products/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
