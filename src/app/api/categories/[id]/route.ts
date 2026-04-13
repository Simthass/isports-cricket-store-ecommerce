// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";

const SubCategoryInput = z.object({
  name: z.string().min(1).max(60).trim(),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(60).trim().optional(),
  image: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined)),
  subCategories: z.array(SubCategoryInput).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

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
    const body = await req.json();
    console.log("[PUT /api/categories/[id]] body:", JSON.stringify(body));

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
      const existing = await Category.findOne({
        name: {
          $regex: `^${parsed.data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
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
      updateData.image = parsed.data.image;
    }

    // Always update subCategories when provided (even empty array = clearing all subs)
    if (body.subCategories !== undefined) {
      const rawSubs: Array<{ name: string }> = body.subCategories || [];
      updateData.subCategories = rawSubs
        .filter((s) => s.name && s.name.trim())
        .map((sc) => ({
          name: sc.name.trim(),
          slug: slugify(sc.name.trim(), { lower: true, strict: true }),
        }));
      console.log(
        "[PUT /api/categories/[id]] updating subCategories:",
        updateData.subCategories,
      );
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    console.log("[PUT /api/categories/[id]] result:", JSON.stringify(updated));
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/categories/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 },
    );
  }
}

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
