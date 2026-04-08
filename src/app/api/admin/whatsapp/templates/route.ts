import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WhatsAppTemplate from "@/models/WhatsAppTemplate";
import { auth } from "@/lib/auth";

// GET - Fetch all templates
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
    const templates = await WhatsAppTemplate.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error("[GET Templates]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

// POST - Create new template
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { title, category, shortcut, messageEnglish, messageArabic } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    if (!messageEnglish?.trim()) {
      return NextResponse.json(
        { success: false, error: "English message is required" },
        { status: 400 },
      );
    }

    // ✅ FIX: Valid category check
    const validCategories = [
      "abandoned_cart",
      "order_confirmation",
      "shipping",
      "review_request",
      "greeting",
      "payment",
      "product",
      "loyalty",
      "other",
    ];

    const finalCategory =
      category && validCategories.includes(category) ? category : "other";

    await connectDB();

    // Check if shortcut is unique
    if (shortcut?.trim()) {
      const existing = await WhatsAppTemplate.findOne({
        shortcut: shortcut.trim(),
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Shortcut already exists" },
          { status: 400 },
        );
      }
    }

    // ✅ FIX: Use correct field names matching schema
    const template = await WhatsAppTemplate.create({
      title: title.trim(),
      category: finalCategory,
      shortcut: shortcut?.trim() || "",
      messageEnglish: messageEnglish.trim(),
      messageArabic: messageArabic?.trim() || null,
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error("[POST Template]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 },
    );
  }
}
