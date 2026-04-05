import twilio from "twilio";
import connectDB from "@/lib/mongodb";
import WhatsAppLog from "@/models/WhatsAppLog";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

const FROM = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

// UAE timezone offset: UTC+4
function isWithinActiveHours(): boolean {
  const now = new Date();
  const uaeHour = (now.getUTCHours() + 4) % 24;
  return uaeHour >= 10 && uaeHour < 20; // 10:00 AM – 8:00 PM
}

interface SendOptions {
  to: string; // E.164 format  e.g. +971526514666
  message: string;
  templateType:
    | "abandoned_cart"
    | "order_confirmation"
    | "review_request"
    | "manual";
  customerName?: string;
  orderId?: string;
  productName?: string;
  ignoreHours?: boolean; // skip active hours check for manual sends
}

export async function sendWhatsApp(
  opts: SendOptions,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const {
    to,
    message,
    templateType,
    customerName,
    orderId,
    productName,
    ignoreHours,
  } = opts;

  await connectDB();

  // Active hours guard
  if (!ignoreHours && !isWithinActiveHours()) {
    await WhatsAppLog.create({
      to,
      customerName,
      templateType,
      message,
      status: "pending",
      orderId,
      productName,
      error: "Outside active hours (10AM–8PM UAE)",
    });
    return { success: false, error: "Outside active hours" };
  }

  // Opt-out check — don't send to opted-out numbers
  const lastLog = await WhatsAppLog.findOne({ to, status: "opted_out" });
  if (lastLog) {
    return { success: false, error: "Number has opted out" };
  }

  // Append STOP footer
  const fullMessage = `${message}\n\nReply STOP to opt-out`;

  try {
    const msg = await client.messages.create({
      from: FROM,
      to: `whatsapp:${to}`,
      body: fullMessage,
    });

    await WhatsAppLog.create({
      to,
      customerName,
      templateType,
      message: fullMessage,
      status: "sent",
      orderId,
      productName,
      twilioSid: msg.sid,
      sentAt: new Date(),
    });

    return { success: true, sid: msg.sid };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    await WhatsAppLog.create({
      to,
      customerName,
      templateType,
      message: fullMessage,
      status: "failed",
      orderId,
      productName,
      error: errorMsg,
      sentAt: new Date(),
    });

    return { success: false, error: errorMsg };
  }
}

// ── Template builders ─────────────────────────────────────────
export function buildAbandonedCartMsg(name: string, product: string): string {
  return `Hi ${name} 🏏 You were looking at ${product}. Still available — want us to hold it?`;
}

export function buildOrderConfirmationMsg(
  name: string,
  method: string,
): string {
  return `Great choice ${name}! Your order is being packed. Delivery: 24hrs. Payment: ${method}`;
}

export function buildReviewRequestMsg(
  name: string,
  product: string,
  gmbLink: string,
): string {
  return `Hi ${name}, how's your ${product}? Leave a review: ${gmbLink}. Reply OFFER for 10% off!`;
}
