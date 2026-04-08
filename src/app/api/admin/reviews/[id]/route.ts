import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";
import mongoose from "mongoose";

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
    const { id } = await params;
    const body = await req.json();
    const { status, adminReply } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminReply) {
      updateData.adminReply = {
        comment: adminReply.comment,
        createdAt: new Date(),
      };
    }

    const review = await Review.findByIdAndUpdate(id, updateData, { new: true });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update product rating if status changed to approved
    if (status === "approved") {
      const ratingAggregation = await Review.aggregate([
        { $match: { productId: review.productId, status: "approved" } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
      ]);
      const avgRating = ratingAggregation[0]?.avgRating || 0;
      const reviewCount = ratingAggregation[0]?.totalReviews || 0;
      await Product.findByIdAndUpdate(review.productId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount,
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Admin review PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}