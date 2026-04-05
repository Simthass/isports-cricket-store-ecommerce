import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";

const SendSchema = z.object({
  phone: z
    .string()
    .min(7)
    .max(16)
    .regex(/^\+?\d+$/, "Must be a valid phone number"),
  message: z.string().min(5).max(1024),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body: unknown = await req.json();
    const parsed = SendSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );

    // Normalise to E.164
    let phone = parsed.data.phone.replace(/\s/g, "");
    if (!phone.startsWith("+")) phone = `+${phone}`;

    const result = await sendWhatsApp({
      to: phone,
      message: parsed.data.message,
      templateType: "manual",
      ignoreHours: false, // still respect UAE hours
    });

    if (!result.success)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (error) {
    console.error("[POST /api/admin/whatsapp/send]", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 },
    );
  }
}
