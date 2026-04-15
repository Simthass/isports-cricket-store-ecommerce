import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import {
  generateQrCodeId,
  generateQrCodeDataUrl,
  generateQrCodeBuffer,
  buildProductQrUrl,
} from "@/lib/qrcode";

type RouteContext = { params: Promise<{ slug: string }> };

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const { slug } = await context.params;
    await connectDB();

    const product = await Product.findOne({ slug })
      .select("name slug qrCode qrCodeId qrScans qrLastScanned")
      .lean();

    if (!product)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );

    // ── Download mode: stream a print-ready PNG ────────────────────────────
    const dl = req.nextUrl.searchParams.get("dl");
    if (dl === "1") {
      if (!product.qrCodeId)
        return NextResponse.json(
          { success: false, error: "No QR code yet" },
          { status: 404 },
        );

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        `https://${req.headers.get("host")}`;
      const qrUrl = buildProductQrUrl(baseUrl, product.qrCodeId);

      // 800 px → prints cleanly at 5×5 cm @ 150 dpi with branded logo badge
      const buffer = await generateQrCodeBuffer({ url: qrUrl, size: 800 });

      // Convert buffer to Uint8Array for NextResponse compatibility
      const uint8Array = new Uint8Array(buffer);

      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="qr-${product.slug}.png"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // ── Normal JSON response ───────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        qrCode: product.qrCode ?? null,
        qrCodeId: product.qrCodeId ?? null,
        qrScans: product.qrScans ?? 0,
        qrLastScanned: product.qrLastScanned ?? null,
      },
    });
  } catch (error) {
    console.error("[GET /api/product/[slug]/qr]", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

// ── POST — generate / regenerate ──────────────────────────────────────────────
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const { slug } = await context.params;
    await connectDB();

    const product = await Product.findOne({ slug });
    if (!product)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );

    // Guarantee uniqueness across the whole collection
    let qrCodeId: string = "";
    let attempts = 0;
    do {
      qrCodeId = generateQrCodeId();
      const collision = await Product.findOne({ qrCodeId })
        .select("_id")
        .lean();
      if (!collision) break;
      attempts++;
    } while (attempts < 10);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;
    const qrUrl = buildProductQrUrl(baseUrl, qrCodeId);

    // 500 px for DB storage — good enough for the admin panel preview
    const qrCode = await generateQrCodeDataUrl({ url: qrUrl, size: 500 });

    const body = await req.json().catch(() => ({}));
    const resetScans = body.resetScans === true;

    await Product.findByIdAndUpdate(product._id, {
      qrCodeId,
      qrCode,
      ...(resetScans ? { qrScans: 0, qrLastScanned: null } : {}),
    });

    return NextResponse.json({
      success: true,
      data: { qrCodeId, qrCode, qrUrl },
    });
  } catch (error) {
    console.error("[POST /api/product/[slug]/qr]", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
