import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

// GET - Fetch reviews for a product
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "newest";

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const query: any = { productId: new mongoose.Types.ObjectId(productId), status: "approved" };
    if (rating && rating !== "all") {
      query.rating = parseInt(rating);
    }

    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest":
        sortOption = { rating: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1 };
        break;
      case "helpful":
        sortOption = { helpful: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ]);

    // Get product rating summary
    const ratingAggregation = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
    ]);

    const ratingSummary = ratingAggregation[0] || { avgRating: 0, totalReviews: 0 };

    return NextResponse.json({
      success: true,
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      ratingSummary: {
        average: Math.round(ratingSummary.avgRating * 10) / 10,
        count: ratingSummary.totalReviews,
      },
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new review
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { productId, rating, title, comment, images } = body;

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    // Check if user has purchased this product (verified purchase)
    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: { $in: ["DELIVERED", "CONFIRMED"] },
      "items.productId": new mongoose.Types.ObjectId(productId),
    });

    const verifiedPurchase = orders.length > 0;

    const review = await Review.create({
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(session.user.id),
      userName: session.user.name || "Customer",
      userEmail: session.user.email,
      rating,
      title,
      comment,
      images: images || [],
      verifiedPurchase,
      status: "approved", // Auto-approve for now (can be changed to pending)
    });

    // Update product rating and review count
    const ratingAggregation = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
    ]);

    const avgRating = ratingAggregation[0]?.avgRating || 0;
    const reviewCount = ratingAggregation[0]?.totalReviews || 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}