import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Optional: Require login for payment (uncomment if you want to force login)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const { amount, currency = "aed", metadata = {} } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create PaymentIntent with automatic payment methods for Google Pay & Apple Pay
    // ✅ Using automatic_payment_methods ONLY (removed payment_method_types)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/fils (AED uses 100 fils = 1 AED)
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        userId: session?.user?.id || "guest",
        userEmail: session?.user?.email || "",
        ...metadata,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
