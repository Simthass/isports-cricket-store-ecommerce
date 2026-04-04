import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";
import { auth } from "@/lib/auth";

// ── Zod Schema ────────────────────────────────────────────────
const UpdateBrandSchema = z.object({
  name: z.string().min(2).max(60).trim().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  country: z.string().max(60).trim().optional().or(z.literal("")),
});

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/brands/[id] ──────────────────────────────────────
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();
    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("[GET /api/brands/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}

// ── PUT /api/brands/[id] ──────────────────────────────────────
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
    const parsed = UpdateBrandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name) {
      const existing = await Brand.findOne({
        name: { $regex: `^${parsed.data.name}$`, $options: "i" },
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A brand with this name already exists" },
          { status: 409 },
        );
      }
      updateData.name = parsed.data.name;
      updateData.slug = slugify(parsed.data.name, {
        lower: true,
        strict: true,
      });
    }

    if (parsed.data.logo !== undefined) {
      updateData.logo = parsed.data.logo || undefined;
    }

    if (parsed.data.country !== undefined) {
      updateData.country = parsed.data.country || undefined;
    }

    const updated = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/brands/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand" },
      { status: 500 },
    );
  }
}

import mongoose from "mongoose";

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

    // Guard: validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    await connectDB();

    const deleted = await Brand.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/brands/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand" },
      { status: 500 },
    );
  }
}
