// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile data from the DB.
 * Uses the single `name` field instead of separate firstName / lastName.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select("name email phone address city emirate")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name ?? "",
      email: user.email ?? session.user.email ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      emirate: user.emirate ?? "",
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/users/profile
 * Updates the authenticated user's profile fields.
 * Accepts { name, phone, email, address, city, emirate }.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, phone, email, address, city, emirate } = body;

    // Build only the fields that were actually sent
    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();
    if (email !== undefined)
      updateData.email = String(email).trim().toLowerCase();
    if (address !== undefined) updateData.address = String(address).trim();
    if (city !== undefined) updateData.city = String(city).trim();
    if (emirate !== undefined) updateData.emirate = String(emirate).trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select("name email phone address city emirate")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: updated.name ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        address: updated.address ?? "",
        city: updated.city ?? "",
        emirate: updated.emirate ?? "",
      },
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
