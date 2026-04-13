import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      inStock: true,
    })
      .limit(limit)
      .populate("brandId", "name")
      .lean();

    return NextResponse.json({ 
      success: true, 
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        images: p.images || [],
        brandId: p.brandId || { name: "" },
        sizes: p.sizes || ["Standard"],
        inStock: p.inStock,
      }))
    });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}