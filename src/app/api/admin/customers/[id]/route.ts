import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

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
    
    const customer = await User.findById(id).select("-password").lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get customer orders
    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // Calculate order statistics
    const orderStats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      lastOrderDate: orders[0]?.createdAt || null,
      pendingOrders: orders.filter(o => o.status === "PENDING").length,
      deliveredOrders: orders.filter(o => o.status === "DELIVERED").length,
      cancelledOrders: orders.filter(o => o.status === "CANCELLED").length,
    };

    return NextResponse.json({
      customer,
      orders,
      orderStats,
    });
  } catch (error) {
    console.error("Customer GET error:", error);
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
    const { name, email, phone, address, city, emirate, role, status } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (emirate !== undefined) updateData.emirate = emirate;
    if (role !== undefined) updateData.role = role;
    
    // Handle first/last name split
    if (name !== undefined && name.includes(" ")) {
      const nameParts = name.split(" ");
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(" ");
    } else if (name !== undefined) {
      updateData.firstName = name;
      updateData.lastName = "";
    }

    const customer = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("Customer PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}