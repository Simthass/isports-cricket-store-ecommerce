// app/api/user/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

/**
 * Default notification preferences returned when a user has none saved yet.
 */
const DEFAULT_NOTIFICATIONS = {
  orderUpdates: true,
  promotions: false,
  newArrivals: true,
  smsAlerts: false,
};

/**
 * GET /api/user/notifications
 * Returns the authenticated user's notification preferences from the DB.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select("notificationSettings")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Merge DB value with defaults so missing keys are always present
    const settings = {
      ...DEFAULT_NOTIFICATIONS,
      ...(user.notificationSettings ?? {}),
    };

    return NextResponse.json({ success: true, notifications: settings });
  } catch (error) {
    console.error("notifications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/user/notifications
 * Updates one or more notification preference flags.
 *
 * Body: Partial<{ orderUpdates, promotions, newArrivals, smsAlerts }>
 * Only the keys that are explicitly sent are updated (partial update).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const allowed = [
      "orderUpdates",
      "promotions",
      "newArrivals",
      "smsAlerts",
    ] as const;

    // Build a dot-notation update so we only touch the changed keys
    const setFields: Record<string, boolean> = {};
    for (const key of allowed) {
      if (key in body && typeof body[key] === "boolean") {
        setFields[`notificationSettings.${key}`] = body[key];
      }
    }

    if (Object.keys(setFields).length === 0) {
      return NextResponse.json(
        { error: "No valid notification fields provided." },
        { status: 400 },
      );
    }

    await dbConnect();
    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { $set: setFields },
      { new: true, runValidators: false },
    )
      .select("notificationSettings")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = {
      ...DEFAULT_NOTIFICATIONS,
      ...(updated.notificationSettings ?? {}),
    };

    return NextResponse.json({ success: true, notifications: settings });
  } catch (error) {
    console.error("notifications PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
