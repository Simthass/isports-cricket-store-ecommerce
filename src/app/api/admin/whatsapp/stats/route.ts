import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WhatsAppLog from "@/models/WhatsAppLog";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    await connectDB();

    const [total, sent, failed, pending, optedOut] = await Promise.all([
      WhatsAppLog.countDocuments({}),
      WhatsAppLog.countDocuments({ status: "sent" }),
      WhatsAppLog.countDocuments({ status: "failed" }),
      WhatsAppLog.countDocuments({ status: "pending" }),
      WhatsAppLog.countDocuments({ status: "opted_out" }),
    ]);

    const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: { total, sent, failed, pending, optedOut, deliveryRate },
    });
  } catch (error) {
    console.error("[GET /api/admin/whatsapp/stats]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
