import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";
import mongoose from "mongoose";

// PATCH - Mark review as helpful
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { action } = await req.json();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "helpful") {
      const userId = new mongoose.Types.ObjectId(session.user.id);
      const alreadyHelpful = review.helpfulUsers.some((uid) => uid.equals(userId));

      if (!alreadyHelpful) {
        review.helpful += 1;
        review.helpfulUsers.push(userId);
        await review.save();
      }
    }

    return NextResponse.json({ success: true, helpful: review.helpful });
  } catch (error) {
    console.error("Review PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a review (user or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if user is admin or the review owner
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = review.userId.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = review.productId;
    await review.deleteOne();

    // Update product rating and review count
    const ratingAggregation = await Review.aggregate([
      { $match: { productId: productId, status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
    ]);

    const avgRating = ratingAggregation[0]?.avgRating || 0;
    const reviewCount = ratingAggregation[0]?.totalReviews || 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}