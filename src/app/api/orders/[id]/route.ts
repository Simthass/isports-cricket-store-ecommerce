import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { status, paymentIntentId } = await req.json();
    const { id } = await params;

    const updateData: any = { status };
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if user is authorized to view this order
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && order.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}