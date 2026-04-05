import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import WhatsAppLog from "@/models/WhatsAppLog";
import { auth } from "@/lib/auth";

// ── POST /api/admin/whatsapp/opt-out ──────────────────────────
// Marks all future messages to a number as opted-out
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body: unknown = await req.json();
    const parsed = z.object({ phone: z.string().min(7) }).safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 },
      );

    await connectDB();

    // Insert an opted_out sentinel record so sendWhatsApp() will block future sends
    await WhatsAppLog.create({
      to: parsed.data.phone,
      templateType: "manual",
      message: "STOP received — opted out",
      status: "opted_out",
      sentAt: new Date(),
    });

    // Also update any pending logs for this number
    await WhatsAppLog.updateMany(
      { to: parsed.data.phone, status: "pending" },
      { status: "opted_out" },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/whatsapp/opt-out]", error);
    return NextResponse.json(
      { success: false, error: "Failed to opt out" },
      { status: 500 },
    );
  }
}
