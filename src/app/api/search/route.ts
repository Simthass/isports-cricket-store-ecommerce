// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

// ── Security: Input sanitization & validation ─────────────────
const MAX_QUERY_LENGTH = 100;
const MIN_QUERY_LENGTH = 1;

// Strip all HTML tags and dangerous characters
function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/[<>"'`]/g, "") // remove XSS chars
    .replace(/javascript:/gi, "") // remove JS protocol
    .replace(/on\w+\s*=/gi, "") // remove event handlers
    .replace(/[{}[\]\\]/g, "") // remove bracket injection chars
    .trim();
}

// Escape special RegEx characters to prevent ReDoS
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Validate and sanitize query param
function sanitizeQuery(
  raw: string | null,
): { ok: true; value: string } | { ok: false; error: string } {
  if (!raw || raw.trim().length < MIN_QUERY_LENGTH) {
    return { ok: false, error: "Query too short" };
  }

  const stripped = stripHtml(raw);

  if (stripped.length < MIN_QUERY_LENGTH) {
    return { ok: false, error: "Query is empty after sanitization" };
  }
  if (stripped.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: "Query too long (max 100 characters)" };
  }

  // Block obvious injection patterns
  const blocked = [
    /\$where/i,
    /\$expr/i,
    /\$function/i, // MongoDB operator injection
    /\beval\b/i,
    /\bexec\b/i, // JS eval/exec
    /union\s+select/i,
    /drop\s+table/i, // SQL injection patterns (belt-and-suspenders)
    /script\s*:/i, // script: protocol
    /__proto__/i,
    /constructor\s*\[/i, // prototype pollution
  ];

  for (const pattern of blocked) {
    if (pattern.test(stripped)) {
      return { ok: false, error: "Invalid characters in query" };
    }
  }

  return { ok: true, value: stripped };
}

function sanitizeSlug(raw: string | null): string | null {
  if (!raw) return null;
  // Slugs are strictly alphanumeric + hyphens only
  const cleaned = raw
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()
    .slice(0, 80);
  return cleaned || null;
}

function sanitizeInt(
  raw: string | null,
  fallback: number,
  min = 1,
  max = 100,
): number {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

// ── Smart search: exact → phrase → word-by-word → category/brand match ──
async function smartSearch(query: string, filter: Record<string, unknown>) {
  const safeQuery = escapeRegex(query);
  const words = query.split(/\s+/).filter(Boolean);

  // 1. Exact name match (highest relevance)
  const exactMatches = await Product.find({
    ...filter,
    name: { $regex: `^${safeQuery}$`, $options: "i" },
  })
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug logo")
    .lean();

  // 2. Name starts with query
  const startsWithMatches = await Product.find({
    ...filter,
    name: { $regex: `^${safeQuery}`, $options: "i" },
    _id: { $nin: exactMatches.map((p) => p._id) },
  })
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug logo")
    .lean();

  // 3. Full phrase match anywhere in name or description
  const phraseMatches = await Product.find({
    ...filter,
    $or: [
      { name: { $regex: safeQuery, $options: "i" } },
      { description: { $regex: safeQuery, $options: "i" } },
    ],
    _id: {
      $nin: [
        ...exactMatches.map((p) => p._id),
        ...startsWithMatches.map((p) => p._id),
      ],
    },
  })
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug logo")
    .lean();

  // 4. All-words match (every word must appear somewhere)
  const wordPatterns = words.map((w) => ({
    $or: [
      { name: { $regex: escapeRegex(w), $options: "i" } },
      { description: { $regex: escapeRegex(w), $options: "i" } },
    ],
  }));
  const allWordMatches =
    wordPatterns.length > 1
      ? await Product.find({
          ...filter,
          $and: wordPatterns,
          _id: {
            $nin: [
              ...exactMatches.map((p) => p._id),
              ...startsWithMatches.map((p) => p._id),
              ...phraseMatches.map((p) => p._id),
            ],
          },
        })
          .populate("categoryId", "name slug")
          .populate("brandId", "name slug logo")
          .lean()
      : [];

  const direct = [
    ...exactMatches,
    ...startsWithMatches,
    ...phraseMatches,
    ...allWordMatches,
  ];

  return direct;
}

// ── Fuzzy / related fallback ──────────────────────────────────
async function relatedSearch(
  query: string,
  excludeIds: unknown[],
  filter: Record<string, unknown>,
) {
  const words = query.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length === 0) return [];

  // Try to find category or brand that matches any word
  const wordPatterns = words.map((w) => ({
    name: { $regex: escapeRegex(w), $options: "i" },
  }));

  const [matchedCategories, matchedBrands] = await Promise.all([
    Category.find({ $or: wordPatterns }).select("_id").lean(),
    Brand.find({ $or: wordPatterns }).select("_id").lean(),
  ]);

  const relatedFilter: Record<string, unknown> = {
    ...filter,
    _id: { $nin: excludeIds },
  };

  if (matchedCategories.length > 0 || matchedBrands.length > 0) {
    const orClauses: Record<string, unknown>[] = [];
    if (matchedCategories.length > 0) {
      orClauses.push({
        categoryId: { $in: matchedCategories.map((c) => c._id) },
      });
    }
    if (matchedBrands.length > 0) {
      orClauses.push({ brandId: { $in: matchedBrands.map((b) => b._id) } });
    }
    // Also try any word match in name
    words.forEach((w) => {
      orClauses.push({ name: { $regex: escapeRegex(w), $options: "i" } });
    });
    relatedFilter.$or = orClauses;
  } else {
    // Fallback: any single word match
    relatedFilter.$or = words.map((w) => ({
      name: { $regex: escapeRegex(w), $options: "i" },
    }));
  }

  return Product.find(relatedFilter)
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug logo")
    .limit(12)
    .lean();
}

// ── GET /api/search ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    // ── Validate all inputs ───────────────────────────────────
    const { searchParams } = new URL(req.url);

    const queryResult = sanitizeQuery(searchParams.get("q"));
    if (!queryResult.ok) {
      return NextResponse.json(
        { success: false, error: queryResult.error },
        { status: 400 },
      );
    }
    const query = queryResult.value;

    const page = sanitizeInt(searchParams.get("page"), 1, 1, 1000);
    const limit = sanitizeInt(searchParams.get("limit"), 12, 1, 48);
    const categorySlug = sanitizeSlug(searchParams.get("category"));
    const sortRaw = searchParams.get("sort") ?? "relevance";
    const allowedSorts = [
      "relevance",
      "price_asc",
      "price_desc",
      "newest",
      "best_sellers",
    ];
    const sort = allowedSorts.includes(sortRaw) ? sortRaw : "relevance";
    const inStock = searchParams.get("inStock") === "true";
    const minPrice = sanitizeInt(searchParams.get("minPrice"), 0, 0, 9999999);
    const maxPrice = sanitizeInt(searchParams.get("maxPrice"), 0, 0, 9999999);

    await connectDB();

    // ── Build base filter ─────────────────────────────────────
    const baseFilter: Record<string, unknown> = {};

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug }).lean();
      if (cat) baseFilter.categoryId = cat._id;
    }

    if (inStock) baseFilter.inStock = true;

    if (minPrice > 0 || maxPrice > 0) {
      baseFilter.price = {};
      if (minPrice > 0)
        (baseFilter.price as Record<string, number>).$gte = minPrice;
      if (maxPrice > 0)
        (baseFilter.price as Record<string, number>).$lte = maxPrice;
    }

    // ── Execute smart search ──────────────────────────────────
    const directResults = await smartSearch(query, baseFilter);

    // ── Apply sort to direct results ──────────────────────────
    if (sort === "price_asc") {
      directResults.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      directResults.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      directResults.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sort === "best_sellers") {
      directResults.sort(
        (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0),
      );
    }

    // ── Paginate direct results ───────────────────────────────
    const total = directResults.length;
    const skip = (page - 1) * limit;
    const paginated = directResults.slice(skip, skip + limit);

    // ── If no direct results, get related / fuzzy results ─────
    let relatedResults: unknown[] = [];
    let relatedLabel = "";
    if (directResults.length === 0) {
      relatedResults = await relatedSearch(query, [], baseFilter);
      if (relatedResults.length > 0) {
        // Determine the label: e.g. "Showing bats from other brands"
        const words = query.split(/\s+/);
        relatedLabel = `No exact results for "${query}". Showing related products.`;
      }
    }

    return NextResponse.json({
      success: true,
      query,
      data: paginated,
      relatedResults: directResults.length === 0 ? relatedResults : [],
      relatedLabel,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 },
    );
  }
}
