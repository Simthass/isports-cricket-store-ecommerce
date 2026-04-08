import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    // Check if user has a delivered or confirmed order containing this product
    const order = await Order.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: { $in: ["DELIVERED", "CONFIRMED"] },
      "items.productId": new mongoose.Types.ObjectId(productId),
    });

    return NextResponse.json({ canReview: !!order });
  } catch (error) {
    console.error("Check purchase error:", error);
    return NextResponse.json({ canReview: false }, { status: 200 });
  }
}