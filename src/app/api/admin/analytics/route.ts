import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Review from "@/models/Review";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateFilter: any = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Default to last 30 days
      const days = period === "day" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 365;
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ORDER STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    const orders = await Order.find(dateFilter);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const ordersByStatus = {
      pending: orders.filter(o => o.status === "PENDING").length,
      confirmed: orders.filter(o => o.status === "CONFIRMED").length,
      processing: orders.filter(o => o.status === "PROCESSING").length,
      shipped: orders.filter(o => o.status === "SHIPPED").length,
      delivered: orders.filter(o => o.status === "DELIVERED").length,
      cancelled: orders.filter(o => o.status === "CANCELLED").length,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DAILY/PERIODIC ORDER TRENDS
    // ─────────────────────────────────────────────────────────────────────────
    const orderTrends = [];
    const now = new Date();
    const daysToShow = period === "day" ? 24 : period === "week" ? 7 : period === "month" ? 30 : 12;
    
    if (period === "month" || period === "year") {
      // Monthly aggregation
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date();
        if (period === "month") {
          date.setDate(date.getDate() - i);
        } else {
          date.setMonth(date.getMonth() - i);
        }
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthOrders = await Order.find({
          createdAt: { $gte: monthStart, $lte: monthEnd },
        });
        
        orderTrends.push({
          label: period === "month" ? `${date.getMonth() + 1}/${date.getDate()}` : date.toLocaleString('default', { month: 'short' }),
          orders: monthOrders.length,
          revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        });
      }
    } else {
      // Daily aggregation
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        const dayOrders = await Order.find({
          createdAt: { $gte: dayStart, $lte: dayEnd },
        });
        
        orderTrends.push({
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. TOP SELLING PRODUCTS
    // ─────────────────────────────────────────────────────────────────────────
    const productSales = new Map();
    
    for (const order of orders) {
      for (const item of order.items) {
        const productId = item.productId.toString();
        if (!productSales.has(productId)) {
          productSales.set(productId, {
            productId,
            name: item.name,
            totalQuantity: 0,
            totalRevenue: 0,
          });
        }
        const product = productSales.get(productId);
        product.totalQuantity += item.quantity;
        product.totalRevenue += item.price * item.quantity;
      }
    }
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. CUSTOMER STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    const totalCustomers = await User.countDocuments({ role: "CUSTOMER" });
    const newCustomers = await User.countDocuments({
      role: "CUSTOMER",
      createdAt: dateFilter.createdAt,
    });
    
    const returningCustomers = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$userId", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: "count" },
    ]);
    
    const returningCustomerCount = returningCustomers[0]?.count || 0;

    // ─────────────────────────────────────────────────────────────────────────
    // 5. REVIEW STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    const reviews = await Review.find();
    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 6. PAYMENT METHOD DISTRIBUTION
    // ─────────────────────────────────────────────────────────────────────────
    const paymentMethods = {
      cod: orders.filter(o => o.paymentMethod === "cod").length,
      card: orders.filter(o => o.paymentMethod === "card").length,
      stripe: orders.filter(o => o.paymentMethod === "stripe").length,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 7. INVENTORY STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    const products = await Product.find();
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockQty <= 5 && p.stockQty > 0).length;
    const outOfStockProducts = products.filter(p => p.stockQty === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stockQty), 0);

    // ─────────────────────────────────────────────────────────────────────────
    // 8. WEEKLY/MONTHLY COMPARISON
    // ─────────────────────────────────────────────────────────────────────────
    const currentPeriodOrders = orders.length;
    const currentPeriodRevenue = totalRevenue;
    
    const previousPeriodStart = new Date(dateFilter.createdAt.$gte);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (period === "month" ? 30 : 7));
    const previousPeriodEnd = new Date(dateFilter.createdAt.$gte);
    
    const previousOrders = await Order.find({
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
    });
    
    const previousPeriodOrders = previousOrders.length;
    const previousPeriodRevenue = previousOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const orderGrowth = previousPeriodOrders > 0 
      ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
      : 0;
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          totalCustomers,
          totalProducts,
          totalReviews,
          avgRating: avgRating.toFixed(1),
        },
        ordersByStatus,
        orderTrends,
        topProducts,
        customerStats: {
          totalCustomers,
          newCustomers,
          returningCustomers: returningCustomerCount,
        },
        reviewStats: {
          totalReviews,
          avgRating: avgRating.toFixed(1),
          ratingDistribution,
        },
        paymentMethods,
        inventoryStats: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalStockValue,
        },
        growthStats: {
          orderGrowth: orderGrowth.toFixed(1),
          revenueGrowth: revenueGrowth.toFixed(1),
          currentPeriodOrders,
          previousPeriodOrders,
          currentPeriodRevenue,
          previousPeriodRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}