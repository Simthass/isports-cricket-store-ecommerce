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
    const user = await User.findById(session.user.id).select("address city emirate").lean();

    return NextResponse.json(user ?? { address: "", city: "", emirate: "" });
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
    const { address, city, emirate } = await req.json();

    await User.findByIdAndUpdate(session.user.id, {
      address: address || "",
      city: city || "",
      emirate: emirate || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}