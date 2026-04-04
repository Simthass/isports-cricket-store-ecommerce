import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";

// ── Zod Schema ────────────────────────────────────────────────
const CreateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60).trim(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// ── GET /api/categories ───────────────────────────────────────
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

// ── POST /api/categories ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: unknown = await req.json();
    const parsed = CreateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, image } = parsed.data;

    await connectDB();

    // Check duplicate name
    const existing = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A category with this name already exists" },
        { status: 409 },
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const category = await Category.create({
      name,
      slug,
      image: image || undefined,
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 },
    );
  }
}
