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
    const user = await User.findById(session.user.id).select("firstName lastName phone email address city emirate").lean();

    return NextResponse.json({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || session.user.email || "",
      address: user?.address || "",
      city: user?.city || "",
      emirate: user?.emirate || "",
    });
  } catch (error) {
    console.error("Address GET error:", error);
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
    const { firstName, lastName, phone, email, address, city, emirate } = await req.json();

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (emirate !== undefined) updateData.emirate = emirate;
    
    // Also update the full name if firstName or lastName changed
    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await User.findById(session.user.id);
      const newFirstName = firstName !== undefined ? firstName : currentUser?.firstName || "";
      const newLastName = lastName !== undefined ? lastName : currentUser?.lastName || "";
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}