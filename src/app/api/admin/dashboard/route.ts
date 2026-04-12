import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Brand from "@/models/Brand";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    // ── Get date ranges for comparison ──
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - 7);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // ── Total Revenue (excluding cancelled orders) ──
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Revenue change (this month vs last month, excluding cancelled)
    const thisMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "CANCELLED" },
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "CANCELLED" },
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const thisMonthRev = thisMonthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueChange =
      lastMonthRev === 0
        ? thisMonthRev > 0
          ? 100
          : 0
        : Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100);

    // ── Total Orders (excluding cancelled) ──
    const totalOrders = await Order.countDocuments({
      status: { $ne: "CANCELLED" },
    });

    // Orders change
    const thisMonthOrders = await Order.countDocuments({
      status: { $ne: "CANCELLED" },
      createdAt: { $gte: startOfThisMonth },
    });
    const lastMonthOrders = await Order.countDocuments({
      status: { $ne: "CANCELLED" },
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const ordersChange =
      lastMonthOrders === 0
        ? thisMonthOrders > 0
          ? 100
          : 0
        : Math.round(
            ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100,
          );

    // ── Total Products ──
    const totalProducts = await Product.countDocuments();

    // Products added this week vs last week
    const thisWeekProducts = await Product.countDocuments({
      createdAt: { $gte: startOfThisWeek },
    });
    const lastWeekProducts = await Product.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
    });
    const productsChange =
      lastWeekProducts === 0
        ? thisWeekProducts > 0
          ? 100
          : 0
        : Math.round(
            ((thisWeekProducts - lastWeekProducts) / lastWeekProducts) * 100,
          );

    // ── Total Customers ──
    const totalCustomers = await User.countDocuments({ role: "CUSTOMER" });

    // Customers added this month vs last month
    const thisMonthCustomers = await User.countDocuments({
      role: "CUSTOMER",
      createdAt: { $gte: startOfThisMonth },
    });
    const lastMonthCustomers = await User.countDocuments({
      role: "CUSTOMER",
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const customersChange =
      lastMonthCustomers === 0
        ? thisMonthCustomers > 0
          ? 100
          : 0
        : Math.round(
            ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) *
              100,
          );

    // ── Recent Orders (last 5) ──
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "orderNumber customerName totalAmount status orderSource createdAt",
      )
      .lean();

    // ── Low Stock Products (stock <= 5) ──
    const lowStock = await Product.find({
      stockQty: { $lte: 5 },
      inStock: true,
    })
      .populate("brandId", "name")
      .populate("categoryId", "name")
      .select("name stockQty slug brandId categoryId")
      .sort({ stockQty: 1 })
      .limit(10)
      .lean();

    // ── Top Brands by sales (from completed orders) ──
    const topBrandsRaw = await Order.aggregate([
      { $match: { status: { $in: ["DELIVERED", "CONFIRMED", "PAID"] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$product.brandId",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 4 },
    ]);

    // Get brand names
    const topBrands = await Promise.all(
      topBrandsRaw.map(async (brand) => {
        if (!brand._id) return { ...brand, name: "Other", _id: "other" };
        const brandDoc = await Brand.findById(brand._id).select("name");
        return {
          ...brand,
          name: brandDoc?.name || "Unknown Brand",
          _id: brand._id.toString(),
        };
      }),
    );

    // Fill with defaults if less than 4 brands
    while (topBrands.length < 4) {
      topBrands.push({
        _id: `placeholder-${topBrands.length}`,
        name: "Other",
        sales: 0,
        revenue: 0,
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueChange,
        ordersChange,
        productsChange,
        customersChange,
      },
      recentOrders,
      lowStock,
      topBrands,
    });
  } catch (error) {
    console.error("[Dashboard API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
