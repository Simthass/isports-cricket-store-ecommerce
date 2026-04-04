import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";
import { auth } from "@/lib/auth";

// ── Zod Schema ────────────────────────────────────────────────
const CreateBrandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60).trim(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  country: z.string().max(60).trim().optional().or(z.literal("")),
});

// ── GET /api/brands ───────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("[GET /api/brands]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 },
    );
  }
}

// ── POST /api/brands ──────────────────────────────────────────
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
    const parsed = CreateBrandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, logo, country } = parsed.data;

    await connectDB();

    const existing = await Brand.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A brand with this name already exists" },
        { status: 409 },
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const brand = await Brand.create({
      name,
      slug,
      logo: logo || undefined,
      country: country || undefined,
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/brands]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand" },
      { status: 500 },
    );
  }
}
