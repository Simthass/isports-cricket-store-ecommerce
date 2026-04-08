import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await connectDB();

    // Atomic increment — fire-and-forget style (no await blocks redirect)
    const product = await Product.findOneAndUpdate(
      { qrCodeId: id },
      {
        $inc: { qrScans: 1 },
        $set: { qrLastScanned: new Date() },
      },
      { new: false, projection: { slug: 1 } },
    ).lean();

    if (!product) {
      // QR code doesn't match any product — show a friendly error page
      return NextResponse.redirect(new URL("/qr-not-found", _req.url));
    }

    // Redirect to the product detail page.
    // The ?via=qr param tells the page to show the "QR Scan" confirmation banner.
    return NextResponse.redirect(
      new URL(`/shop/product/${product.slug}?via=qr`, _req.url),
      { status: 307 }, // 307 = temporary so analytics tools still hit this endpoint
    );
  } catch (error) {
    console.error("[GET /qr/[id]]", error);
    return NextResponse.redirect(new URL("/shop", _req.url));
  }
}
