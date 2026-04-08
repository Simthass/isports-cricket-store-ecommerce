import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WhatsAppTemplate from "@/models/WhatsAppTemplate";
import { auth } from "@/lib/auth";

// GET - Single template
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // ✅ FIX: await params to get id
    const { id } = await params;

    await connectDB();
    const template = await WhatsAppTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error("[GET Template]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch" },
      { status: 500 },
    );
  }
}

// PUT - Update template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // ✅ FIX: await params to get id
    const { id } = await params;

    const body = await req.json();
    const { title, category, shortcut, messageEnglish, messageArabic } = body;

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

    await connectDB();

    // Check if shortcut is unique (excluding current template)
    if (shortcut?.trim()) {
      const existing = await WhatsAppTemplate.findOne({
        shortcut: shortcut.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Shortcut already exists" },
          { status: 400 },
        );
      }
    }

    const template = await WhatsAppTemplate.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        category: category || "other",
        shortcut: shortcut?.trim() || "",
        messageEnglish: messageEnglish.trim(),
        messageArabic: messageArabic?.trim() || null,
      },
      { new: true, runValidators: true },
    );

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error("[PUT Template]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 },
    );
  }
}

// DELETE - Remove template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // ✅ FIX: await params to get id
    const { id } = await params;

    await connectDB();
    const template = await WhatsAppTemplate.findByIdAndDelete(id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE Template]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 },
    );
  }
}
