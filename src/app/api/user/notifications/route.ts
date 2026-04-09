import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("notificationPreferences").lean();

    return NextResponse.json({
      success: true,
      preferences: user?.notificationPreferences || {
        orderUpdates: true,
        promotions: false,
        newArrivals: true,
        smsAlerts: false,
      },
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { orderUpdates, promotions, newArrivals, smsAlerts } = body;

    const updateData = {
      notificationPreferences: {
        orderUpdates: orderUpdates !== undefined ? orderUpdates : true,
        promotions: promotions !== undefined ? promotions : false,
        newArrivals: newArrivals !== undefined ? newArrivals : true,
        smsAlerts: smsAlerts !== undefined ? smsAlerts : false,
      },
    };

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select("notificationPreferences");

    return NextResponse.json({
      success: true,
      preferences: user?.notificationPreferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}