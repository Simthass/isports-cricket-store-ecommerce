import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import mongoose from "mongoose";

// ── Security helpers (same rules as main search) ──────────────
function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[{}[\]\\]/g, "")
    .trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeSuggestionQuery(
  raw: string | null,
): { ok: true; value: string } | { ok: false; error: string } {
  if (!raw || raw.trim().length < 2) return { ok: false, error: "Too short" };
  const stripped = stripHtml(raw);
  if (stripped.length < 2)
    return { ok: false, error: "Too short after sanitization" };
  if (stripped.length > 60) return { ok: false, error: "Too long" };

  const blocked = [
    /\$where/i,
    /\$expr/i,
    /\$function/i,
    /\beval\b/i,
    /union\s+select/i,
    /__proto__/i,
    /constructor\s*\[/i,
  ];
  for (const p of blocked) {
    if (p.test(stripped)) return { ok: false, error: "Invalid query" };
  }

  return { ok: true, value: stripped };
}

// ── GET /api/search/suggestions ───────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const result = sanitizeSuggestionQuery(searchParams.get("q"));

    if (!result.ok) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const query = result.value;
    const safe = escapeRegex(query);

    await connectDB();

    // Run all 3 in parallel for speed
    const [products, categories, brands] = await Promise.all([
      Product.find({ name: { $regex: safe, $options: "i" } })
        .select("name slug price images brandId")
        .populate("brandId", "name")
        .limit(5)
        .lean(),
      Category.find({ name: { $regex: safe, $options: "i" } })
        .select("name slug")
        .limit(3)
        .lean(),
      Brand.find({ name: { $regex: safe, $options: "i" } })
        .select("name slug logo")
        .limit(3)
        .lean(),
    ]);

    const suggestions = {
      products: products.map((p) => {
        // Safely extract brand name - handle both populated and unpopulated cases
        let brandName = "";
        if (p.brandId) {
          if (typeof p.brandId === "object" && "name" in p.brandId) {
            brandName = (p.brandId as { name: string }).name;
          } else if (p.brandId instanceof mongoose.Types.ObjectId) {
            brandName = "";
          }
        }

        return {
          _id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.images?.[0] ?? null,
          brand: brandName,
        };
      }),
      categories: categories.map((c) => ({ name: c.name, slug: c.slug })),
      brands: brands.map((b) => ({
        name: b.name,
        slug: b.slug,
        logo: b.logo ?? null,
      })),
    };

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("[GET /api/search/suggestions]", error);
    return NextResponse.json({
      success: true,
      suggestions: { products: [], categories: [], brands: [] },
    });
  }
}
