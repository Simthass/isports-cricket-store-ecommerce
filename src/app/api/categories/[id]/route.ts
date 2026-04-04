import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";

// ── Zod Schema ────────────────────────────────────────────────
const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(60).trim().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/categories/[id] ──────────────────────────────────
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();
    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("[GET /api/categories/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// ── PUT /api/categories/[id] ──────────────────────────────────
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = UpdateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name) {
      // Check duplicate name (excluding this doc)
      const existing = await Category.findOne({
        name: { $regex: `^${parsed.data.name}$`, $options: "i" },
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A category with this name already exists" },
          { status: 409 },
        );
      }
      updateData.name = parsed.data.name;
      updateData.slug = slugify(parsed.data.name, {
        lower: true,
        strict: true,
      });
    }

    if (parsed.data.image !== undefined) {
      updateData.image = parsed.data.image || undefined;
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/categories/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/categories/[id] ───────────────────────────────
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    await connectDB();

    const deleted = await Category.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/categories/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
