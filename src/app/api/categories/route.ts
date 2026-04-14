// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";

const SubCategoryInput = z.object({
  name: z.string().min(1).max(60).trim(),
});

const CreateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60).trim(),
  image: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined)),
  // Accept array of {name} objects — slugs are generated server-side
  subCategories: z.array(SubCategoryInput).optional().default([]),
});

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

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
    console.log("[POST /api/categories] body:", JSON.stringify(body));

    const parsed = CreateCategorySchema.safeParse(body);
    if (!parsed.success) {
      console.error(
        "[POST /api/categories] validation error:",
        parsed.error.flatten(),
      );
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, image, subCategories } = parsed.data;
    console.log("[POST /api/categories] parsed subCategories:", subCategories);

    await connectDB();

    const existing = await Category.findOne({
      name: {
        $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A category with this name already exists" },
        { status: 409 },
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const builtSubCategories = (subCategories || []).map((sc) => ({
      name: sc.name.trim(),
      slug: slugify(sc.name.trim(), { lower: true, strict: true }),
    }));

    console.log(
      "[POST /api/categories] creating with subCategories:",
      builtSubCategories,
    );

    const category = await Category.create({
      name,
      slug,
      ...(image ? { image } : {}),
      subCategories: builtSubCategories,
    });

    // Return the full document with subCategories
    const result = await Category.findById(category._id).lean();
    console.log("[POST /api/categories] saved result:", JSON.stringify(result));

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 },
    );
  }
}
