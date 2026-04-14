import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const cart = await Cart.findOne({ userId: session.user.id }).lean();
    const cartData = cart ?? { items: [], totalItems: 0, totalPrice: 0 };
    return NextResponse.json({ 
      items: cartData.items,
      totalItems: cartData.totalItems,
      totalPrice: cartData.totalPrice
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { productId, name, brand, price, qty = 1, size = "Standard", image } = body;

    if (!productId || !name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [] });
    }

    const existing = cart.items.find(
      (item: any) => item.productId.toString() === productId && item.size === size
    );

    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        name,
        brand: brand ?? "",
        price,
        qty,
        size,
        image: image ?? "",
      });
    }

    cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.qty, 0);
    cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);

    await cart.save();
    return NextResponse.json({ 
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice
    });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { productId, size, qty } = await req.json();

    if (!productId || !size || qty === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.find(
      (item: any) => item.productId.toString() === productId && item.size === size
    );

    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    item.qty = Math.max(1, qty);
    
    cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.qty, 0);
    cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    
    await cart.save();
    return NextResponse.json({ 
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice
    });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { productId, size, clearAll } = body;

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (clearAll) {
      cart.items = [];
    } else {
      if (!productId || !size) {
        return NextResponse.json({ error: "productId and size required" }, { status: 400 });
      }
      cart.items = cart.items.filter(
        (item: any) => !(item.productId.toString() === productId && item.size === size)
      );
    }

    cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.qty, 0);
    cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);

    await cart.save();
    return NextResponse.json({ 
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice
    });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}