import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import WhatsAppOrder from "@/models/WhatsAppOrder";
import Product from "@/models/Product";

async function reduceStock(items: any[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stockQty -= item.quantity;
      product.inStock = product.stockQty > 0;
      await product.save();
    }
  }
}

async function restoreStock(items: any[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stockQty += item.quantity;
      product.inStock = true;
      await product.save();
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = {};
    if (status && status !== "all") query.status = status;

    const [orders, total] = await Promise.all([
      WhatsAppOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WhatsAppOrder.countDocuments(query),
    ]);

    const pendingCount = await WhatsAppOrder.countDocuments({ status: "WAITING_CONFIRMATION" });

    return NextResponse.json({
      orders,
      pendingCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("WhatsApp orders GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { customerInfo, items, subtotal, total, customerNotes } = body;

    if (!customerInfo?.name || !customerInfo?.phone || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subtotalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotalAmount;

    const order = await WhatsAppOrder.create({
      customerInfo,
      items,
      originalItems: items,
      subtotal: subtotalAmount,
      total: totalAmount,
      status: "WAITING_CONFIRMATION",
      customerNotes: customerNotes || "",
    });

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("WhatsApp order POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}