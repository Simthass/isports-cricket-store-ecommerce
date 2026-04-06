import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ISP-${timestamp}-${random}`;
}

async function sendAdminEmail(order: any) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const itemRows = order.items
      .map(
        (i: any) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.name}${i.brand ? `<br/><small style="color:#6b7280">${i.brand}</small>` : ''}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.size ?? "-"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">AED ${(i.price * i.quantity).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    const subtotal = order.subtotal || order.totalAmount;
    const discount = order.discount || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.totalAmount;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px">
        <div style="background:#004b9c;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">🏏 New Order Received</h1>
          <p style="color:#81bf42;margin:6px 0 0;font-size:14px">iSPORTS Cricket Store</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 8px 8px">
          <p style="font-size:15px;color:#374151">A new order has been placed on iSPORTS.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Order #:</strong> ${order.orderNumber}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Customer:</strong> ${order.customerName}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Email:</strong> ${order.customerEmail}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Phone:</strong> ${order.customerPhone}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Address:</strong> ${order.deliveryAddress}, ${order.city}${order.emirate ? `, ${order.emirate}` : ''}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
            ${order.paymentIntentId ? `<p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Payment ID:</strong> ${order.paymentIntentId}</p>` : ''}
            ${order.deliveryMethod ? `<p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Delivery:</strong> ${order.deliveryMethod === 'express' ? 'Express Shipping' : 'Standard Delivery'}</p>` : ''}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="padding:10px 12px;text-align:left">Item</th>
                <th style="padding:10px 12px;text-align:center">Size</th>
                <th style="padding:10px 12px;text-align:center">Qty</th>
                <th style="padding:10px 12px;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb">
            <div style="text-align:right">
              <p style="margin:4px 0;font-size:13px;color:#6b7280">Subtotal: AED ${subtotal.toLocaleString()}</p>
              ${discount > 0 ? `<p style="margin:4px 0;font-size:13px;color:#81bf42">Discount: -AED ${discount.toLocaleString()}</p>` : ''}
              <p style="margin:4px 0;font-size:13px;color:#6b7280">Shipping: ${shippingCost === 0 ? 'FREE' : `AED ${shippingCost.toLocaleString()}`}</p>
              <p style="font-size:18px;font-weight:bold;color:#004b9c;margin:8px 0 0">Total: AED ${total.toLocaleString()}</p>
            </div>
          </div>
          <div style="margin-top:24px;text-align:center">
            <a href="${process.env.NEXTAUTH_URL}/admin/orders" style="background:#004b9c;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
              View in Admin Panel →
            </a>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"iSPORTS Orders" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL ?? process.env.GMAIL_USER,
      subject: `🏏 New Order #${order.orderNumber} — AED ${order.totalAmount}`,
      html,
    });
  } catch (error) {
    console.error("Admin email send error:", error);
  }
}

async function sendCustomerEmail(order: any) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const itemRows = order.items
      .map(
        (i: any) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.name}${i.brand ? `<br/><small style="color:#6b7280">${i.brand}</small>` : ''}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.size ?? "-"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">AED ${(i.price * i.quantity).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    const subtotal = order.subtotal || order.totalAmount;
    const discount = order.discount || 0;
    const shippingCost = order.shippingCost || 0;
    const total = order.totalAmount || order.total;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px">
        <div style="background:#004b9c;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">🏏 Order Confirmation</h1>
          <p style="color:#81bf42;margin:6px 0 0;font-size:14px">iSPORTS Cricket Store</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 8px 8px">
          <p style="font-size:15px;color:#374151">Dear ${order.customerName},</p>
          <p style="font-size:15px;color:#374151">Thank you for your order! We've received your order and will process it soon.</p>
          
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Order #:</strong> ${order.orderNumber}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p style="margin:4px 0;font-size:13px;color:#6b7280"><strong>Delivery Address:</strong> ${order.deliveryAddress}, ${order.city}</p>
          </div>
          
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="padding:10px 12px;text-align:left">Item</th>
                <th style="padding:10px 12px;text-align:center">Size</th>
                <th style="padding:10px 12px;text-align:center">Qty</th>
                <th style="padding:10px 12px;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb">
            <div style="text-align:right">
              <p style="margin:4px 0;font-size:13px;color:#6b7280">Subtotal: AED ${subtotal.toLocaleString()}</p>
              ${discount > 0 ? `<p style="margin:4px 0;font-size:13px;color:#81bf42">Discount: -AED ${discount.toLocaleString()}</p>` : ''}
              <p style="margin:4px 0;font-size:13px;color:#6b7280">Shipping: ${shippingCost === 0 ? 'FREE' : `AED ${shippingCost.toLocaleString()}`}</p>
              <p style="font-size:18px;font-weight:bold;color:#004b9c;margin:8px 0 0">Total: AED ${total.toLocaleString()}</p>
            </div>
          </div>
          
          <div style="margin-top:24px;text-align:center;padding-top:16px;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af">We'll notify you once your order is shipped.</p>
            <p style="font-size:12px;color:#9ca3af">For any questions, contact us at +971 52 6514 666 or info@isportscricket.com</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"iSPORTS Cricket" <${process.env.GMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmation #${order.orderNumber} - iSPORTS Cricket`,
      html,
    });
    
    console.log(`Customer email sent to ${order.customerEmail}`);
  } catch (error) {
    console.error("Customer email send error:", error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const status = searchParams.get("status");

    const isAdmin = session.user.role === "ADMIN";
    const query: any = isAdmin ? {} : { userId: session.user.id };
    if (status && status !== "ALL") query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    await dbConnect();
    const body = await req.json();

    let orderData: any;
    
    // Check if this is from the new checkout flow (with customerInfo object)
    if (body.customerInfo) {
      // New structure from Stripe/COD checkout
      const { customerInfo, items, deliveryMethod, paymentMethod, paymentIntentId, subtotal, discount, shippingCost, total, couponApplied, status } = body;
      
      orderData = {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
        userEmail: session?.user?.email || customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim(),
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        deliveryAddress: customerInfo.address,
        city: customerInfo.city,
        emirate: customerInfo.emirate || "",
        paymentMethod: paymentMethod === 'stripe' ? 'card' : paymentMethod,
        paymentIntentId: paymentIntentId || undefined,
        orderSource: "web",
        status: status || (paymentMethod === 'stripe' ? 'PAID' : 'PENDING'),
        totalAmount: total,
        subtotal: subtotal,
        discount: discount || 0,
        shippingCost: shippingCost || 0,
        couponApplied: couponApplied || false,
        deliveryMethod: deliveryMethod || "standard",
        notes: customerInfo.notes || "",
        items: items.map((item: any) => ({
          productId: new mongoose.Types.ObjectId(item.productId),
          name: item.name,
          brand: item.brand || "",
          price: item.price,
          quantity: item.quantity,
          size: item.size || "Standard",
          image: item.image || null,
        })),
      };
    } else {
      // Old structure (backward compatibility)
      const {
        customerName, customerEmail, customerPhone,
        deliveryAddress, city, emirate,
        paymentMethod, deliveryType, notes,
        items, totalAmount, orderSource, saveAddress,
      } = body;

      if (!customerName || !customerEmail || !customerPhone || !deliveryAddress || !city || !items?.length) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      orderData = {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
        userEmail: customerEmail,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        deliveryAddress: deliveryAddress,
        city: city,
        emirate: emirate || "",
        paymentMethod: paymentMethod,
        orderSource: orderSource ?? "web",
        status: paymentMethod === 'cod' ? 'PENDING' : 'PAID',
        totalAmount: totalAmount,
        subtotal: totalAmount,
        discount: 0,
        shippingCost: 0,
        couponApplied: false,
        deliveryMethod: deliveryType || "standard",
        notes: notes || "",
        items: items.map((item: any) => ({
          productId: new mongoose.Types.ObjectId(item.productId),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || "Standard",
          image: item.image,
        })),
      };

      if (saveAddress && session?.user?.id) {
        try {
          await User.findByIdAndUpdate(session.user.id, {
            address: deliveryAddress,
            city,
            emirate: emirate ?? "",
          });
        } catch (e) {
          console.error("Failed to save address:", e);
        }
      }
    }

    const order = await Order.create(orderData);

    // Send email notifications
    sendAdminEmail(order).catch((e) => console.error("Admin email failed:", e));
    sendCustomerEmail(order).catch((e) => console.error("Customer email failed:", e));

    return NextResponse.json({ 
      success: true, 
      orderNumber: order.orderNumber, 
      orderId: order._id 
    }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}