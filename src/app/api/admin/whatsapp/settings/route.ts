import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

// In-memory defaults (swap for DB in production if you want persistence across restarts)
let settings = {
  abandonedCart: true,
  orderConfirmation: true,
  reviewRequest: true,
  activeHoursOnly: true,
};

export function getWhatsAppSettings() {
  return settings;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[GET /api/admin/whatsapp/settings]", error);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body: unknown = await req.json();
    const parsed = z
      .object({
        abandonedCart: z.boolean().optional(),
        orderConfirmation: z.boolean().optional(),
        reviewRequest: z.boolean().optional(),
        activeHoursOnly: z.boolean().optional(),
      })
      .safeParse(body);

    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );

    settings = { ...settings, ...parsed.data };
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[PUT /api/admin/whatsapp/settings]", error);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 },
    );
  }
}
