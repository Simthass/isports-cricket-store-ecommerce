"use client";

import React, { useState } from "react";
import { MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WhatsAppButtonProps {
  variant?: "product" | "cart";
  product?: {
    id: string;
    name: string;
    price: number;
    size?: string;
    image?: string;
  };
  className?: string;
}

export default function WhatsAppButton({
  variant = "product",
  product,
  className = "",
}: WhatsAppButtonProps) {
  const { cartItems } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleOrder = async () => {
    setLoading(true);

    let items = [];
    let customerName = session?.user?.name || "";
    let customerPhone = (session?.user as any)?.phone || "";
    let customerEmail = session?.user?.email || "";
    let subtotal = 0;

    if (variant === "product" && product) {
      items = [
        {
          productId: product.id,
          name: product.name,
          brand: "iSPORTS",
          price: product.price,
          quantity: 1,
          size: product.size || "Standard",
          image: product.image,
        },
      ];
      subtotal = product.price;
    } else {
      items = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
      }));
      subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }

    // If user is logged in, use their info
    if (session?.user) {
      // Fetch latest user data
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          customerName = data.user?.name || session.user.name || "";
          customerPhone = data.user?.phone || "";
          customerEmail = data.user?.email || session.user.email || "";
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    } else {
      // For guests, prompt for info
      customerName = prompt("Please enter your name:") || "";
      customerPhone =
        prompt("Please enter your WhatsApp number (with country code):") || "";
      if (!customerName || !customerPhone) {
        setLoading(false);
        alert("Name and phone number are required to place order.");
        return;
      }
    }

    try {
      const res = await fetch("/api/whatsapp/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
          },
          items,
          subtotal,
          total: subtotal,
          customerNotes: `Order from ${variant === "product" ? "product page" : "cart"}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreated(true);

        // Build WhatsApp message
        const itemLines = items
          .map(
            (i) =>
              `• ${i.name} (${i.size}) x${i.quantity} - AED ${i.price * i.quantity}`,
          )
          .join("\n");
        const message =
          `🏏 *NEW ORDER REQUEST*\n\n` +
          `*Customer:* ${customerName}\n` +
          `*Phone:* ${customerPhone}\n` +
          `*Email:* ${customerEmail || "Not provided"}\n\n` +
          `*Items:*\n${itemLines}\n\n` +
          `*Total:* AED ${subtotal.toLocaleString()}\n\n` +
          `*Order #:* ${data.order.orderNumber}\n\n` +
          `Please confirm this order. Thank you!`;

        const whatsappUrl = `https://wa.me/+94764078448?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

        setTimeout(() => {
          setLoading(false);
          if (variant === "cart") {
            router.push("/admin/whatsapp");
          }
        }, 2000);
      } else {
        alert(data.error || "Failed to create order. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("WhatsApp order error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleOrder}
      disabled={loading || created}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black tracking-wider uppercase transition-all duration-200 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: "#25D366", color: "white" }}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : created ? (
        <>
          <CheckCircle2 size={18} />
          Order Created!
        </>
      ) : (
        <>
          <MessageCircle size={18} />
          Order via WhatsApp
        </>
      )}
    </button>
  );
}
