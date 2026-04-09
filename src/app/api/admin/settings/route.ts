import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { auth } from "@/lib/auth";

// GET - Fetch all settings
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    let settings = await SiteSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await SiteSettings.create({
        siteTitle: "iSPORTS Cricket | UAE's Premium Cricket Store",
        siteDescription:
          "Shop professional cricket gear in Sharjah, Ajman, and across UAE.",
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[GET Settings]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT - Update settings
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    await connectDB();

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { ...body, updatedBy: session.user.id, updatedAt: new Date() },
      { new: true, upsert: true },
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[PUT Settings]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
