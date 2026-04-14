import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import WhatsAppOrder from "@/models/WhatsAppOrder";
import Product from "@/models/Product";
import Order, { OrderStatus } from "@/models/Order";
import mongoose from "mongoose";

async function reduceStock(items: any[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stockQty -= item.quantity;
      product.inStock = product.stockQty > 0;
      await product.save();
    }
  }
}

async function restoreStock(items: any[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stockQty += item.quantity;
      product.inStock = true;
      await product.save();
    }
  }
}

// Helper function to find existing regular order from WhatsApp order
async function findExistingRegularOrder(whatsappOrderId: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(whatsappOrderId)) {
      console.log("Invalid ObjectId:", whatsappOrderId);
      return null;
    }
    const existingOrder = await Order.findOne({ 
      whatsappOrderId: new mongoose.Types.ObjectId(whatsappOrderId) 
    });
    return existingOrder;
  } catch (error) {
    console.error("Error finding existing order:", error);
    return null;
  }
}

// Helper function to create or update a regular order from WhatsApp order
async function syncRegularOrder(whatsappOrder: any, deliveryAddress?: string, status?: string) {
  try {
    // Check if regular order already exists
    let existingOrder = await findExistingRegularOrder(whatsappOrder._id);
    
    // Generate a regular order number (ORD-xxxxx) if new
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const regularOrderNumber = existingOrder ? existingOrder.orderNumber : `ORD-${timestamp}-${random}`;

    // Format items to match Order model structure
    const formattedItems = whatsappOrder.items.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      name: item.name,
      brand: item.brand || "",
      price: item.price,
      quantity: item.quantity,
      size: item.size || "Standard",
      image: item.image || "",
    }));

    // Ensure all required fields have values
    const finalDeliveryAddress = deliveryAddress || whatsappOrder.deliveryAddress || "Address pending - customer will provide via WhatsApp";
    const finalCity = "Dubai";
    const finalPhone = whatsappOrder.customerInfo.phone || "Not provided";
    const finalCustomerName = whatsappOrder.customerInfo.name || "WhatsApp Customer";
    const finalCustomerEmail = whatsappOrder.customerInfo.email || `whatsapp-${whatsappOrder.orderNumber}@temp.com`;
    
    // Map WhatsApp order status to regular order status with proper typing
    let orderStatus: OrderStatus = "PENDING";
    if (status === "CONFIRMED") {
      orderStatus = "CONFIRMED";
    } else if (status === "CANCELLED") {
      orderStatus = "CANCELLED";
    } else if (whatsappOrder.status === "CONFIRMED") {
      orderStatus = "CONFIRMED";
    } else if (whatsappOrder.status === "CANCELLED") {
      orderStatus = "CANCELLED";
    }

    if (existingOrder) {
      // UPDATE existing regular order
      existingOrder.customerName = finalCustomerName;
      existingOrder.customerEmail = finalCustomerEmail;
      existingOrder.customerPhone = finalPhone;
      existingOrder.deliveryAddress = finalDeliveryAddress;
      existingOrder.city = finalCity;
      existingOrder.status = orderStatus;
      existingOrder.totalAmount = whatsappOrder.total;
      existingOrder.subtotal = whatsappOrder.subtotal;
      existingOrder.discount = whatsappOrder.discount || 0;
      existingOrder.shippingCost = whatsappOrder.shippingCost || 0;
      existingOrder.notes = whatsappOrder.customerNotes || whatsappOrder.adminNotes || "";
      existingOrder.items = formattedItems;
      existingOrder.updatedAt = new Date();
      
      await existingOrder.save();
      console.log(`✅ Updated regular order ${existingOrder.orderNumber} from WhatsApp order ${whatsappOrder.orderNumber} (Status: ${orderStatus})`);
      return existingOrder;
    } else {
      // CREATE new regular order
      const regularOrder = await Order.create({
        orderNumber: regularOrderNumber,
        customerName: finalCustomerName,
        customerEmail: finalCustomerEmail,
        customerPhone: finalPhone,
        deliveryAddress: finalDeliveryAddress,
        city: finalCity,
        emirate: "",
        paymentMethod: whatsappOrder.paymentMethod || "cod",
        orderSource: "whatsapp",
        status: orderStatus,
        totalAmount: whatsappOrder.total,
        subtotal: whatsappOrder.subtotal,
        discount: whatsappOrder.discount || 0,
        shippingCost: whatsappOrder.shippingCost || 0,
        couponApplied: false,
        deliveryMethod: "standard",
        notes: whatsappOrder.customerNotes || whatsappOrder.adminNotes || "",
        items: formattedItems,
        whatsappOrderId: whatsappOrder._id,
        createdAt: whatsappOrder.createdAt || new Date(),
      });
      
      console.log(`✅ Created regular order ${regularOrder.orderNumber} from WhatsApp order ${whatsappOrder.orderNumber} (Status: ${orderStatus})`);
      return regularOrder;
    }
  } catch (error) {
    console.error("Failed to sync regular order from WhatsApp:", error);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const order = await WhatsAppOrder.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("WhatsApp order GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { status, items, adminNotes, deliveryAddress, customerInfo, subtotal, total } = body;

    const order = await WhatsAppOrder.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    // Update customer info if provided
    if (customerInfo) {
      order.customerInfo = {
        ...order.customerInfo,
        ...customerInfo,
      };
    }

    // Update items if provided
    if (items) {
      order.items = items;
      order.subtotal = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
      order.total = order.subtotal - order.discount + order.shippingCost;
    }

    // Update subtotal and total if provided
    if (subtotal !== undefined) {
      order.subtotal = subtotal;
    }
    if (total !== undefined) {
      order.total = total;
    }
    
    // Update admin notes if provided
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }
    
    // Update delivery address if provided
    if (deliveryAddress !== undefined) {
      order.deliveryAddress = deliveryAddress;
    }

    // Handle CONFIRMED status
    if (status === "CONFIRMED" && oldStatus !== "CONFIRMED") {
      // Reduce stock using current items
      await reduceStock(order.items);
      order.confirmedAt = new Date();
      order.status = "CONFIRMED";
      
      // Save WhatsApp order first
      await order.save();
      
      // Sync/Create regular order in Order Management (status will be CONFIRMED)
      const syncedOrder = await syncRegularOrder(order, deliveryAddress, "CONFIRMED");
      
      if (syncedOrder) {
        console.log(`✅ WhatsApp order ${order.orderNumber} confirmed and synced to Order Management`);
      } else {
        console.error(`❌ Failed to sync order for WhatsApp order ${order.orderNumber}`);
      }
      
    } 
    // Handle CANCELLED status
    else if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
      // Restore stock on cancel
      await restoreStock(order.items);
      order.cancelledAt = new Date();
      order.status = "CANCELLED";
      
      // Save WhatsApp order first
      await order.save();
      
      // Sync/Create regular order in Order Management (status will be CANCELLED)
      const syncedOrder = await syncRegularOrder(order, deliveryAddress, "CANCELLED");
      
      if (syncedOrder) {
        console.log(`✅ WhatsApp order ${order.orderNumber} cancelled and synced to Order Management`);
      } else {
        console.error(`❌ Failed to sync cancelled order for WhatsApp order ${order.orderNumber}`);
      }
    }
    // Handle other updates (not confirming or cancelling)
    else {
      order.status = status || order.status;
      await order.save();
      
      // If order was already confirmed/cancelled before, sync the updates
      if (oldStatus === "CONFIRMED" || oldStatus === "CANCELLED") {
        const syncedOrder = await syncRegularOrder(order, deliveryAddress, oldStatus);
        if (syncedOrder) {
          console.log(`✅ WhatsApp order ${order.orderNumber} updates synced to Order Management`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      order,
      message: status === "CONFIRMED" ? "Order confirmed and synced to Orders Management" : 
               status === "CANCELLED" ? "Order cancelled and synced to Orders Management" : 
               "Order updated"
    });
  } catch (error) {
    console.error("WhatsApp order PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const order = await WhatsAppOrder.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CONFIRMED") {
      await restoreStock(order.items);
    }

    order.status = "CANCELLED";
    order.cancelledAt = new Date();
    await order.save();
    
    // Also update the regular order status to CANCELLED
    const syncedOrder = await syncRegularOrder(order, order.deliveryAddress, "CANCELLED");
    
    if (syncedOrder) {
      console.log(`✅ WhatsApp order ${order.orderNumber} deleted/cancelled and synced to Order Management`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp order DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}