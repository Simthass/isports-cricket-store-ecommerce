// src/app/api/home/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Newsletter from "@/models/Newsletter";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, source = "homepage" } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Get IP address and user agent
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingSubscriber) {
      // If exists but unsubscribed, reactivate
      if (existingSubscriber.status === "unsubscribed") {
        existingSubscriber.status = "active";
        existingSubscriber.unsubscribedAt = undefined;
        existingSubscriber.ipAddress = ipAddress;
        existingSubscriber.userAgent = userAgent;
        existingSubscriber.source = source;
        await existingSubscriber.save();

        return NextResponse.json({
          success: true,
          message: "Welcome back! You've been resubscribed.",
          data: {
            email: existingSubscriber.email,
            status: existingSubscriber.status,
          },
        });
      }

      // Already active subscriber
      return NextResponse.json(
        {
          success: false,
          error: "This email is already subscribed to our newsletter",
        },
        { status: 409 },
      );
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({
      email: email.toLowerCase().trim(),
      status: "active",
      ipAddress,
      userAgent,
      source,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to the newsletter!",
        data: { email: subscriber.email, status: subscriber.status },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "This email is already subscribed to our newsletter",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to subscribe. Please try again later." },
      { status: 500 },
    );
  }
}

// Optional: GET endpoint for admin to view subscribers (admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // You can add authentication here for admin access
    // For now, return 401 if you want to protect this endpoint
    // const session = await auth();
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const status = searchParams.get("status") || "active";

    const query: any = {};
    if (status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      Newsletter.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),
      Newsletter.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET subscribers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}

// Optional: DELETE endpoint for unsubscribe
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const subscriber = await Newsletter.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: "Email not found in our records" },
        { status: 404 },
      );
    }

    // Soft delete - mark as unsubscribed
    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from the newsletter",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
