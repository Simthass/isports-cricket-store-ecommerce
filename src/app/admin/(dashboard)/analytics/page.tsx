"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp, TrendingDown, ShoppingBag, DollarSign,
  Users, Package, Star, Calendar, Download, Share2,
  FileText, Printer, BarChart3, PieChart, Loader2,
  RefreshCw, ChevronDown, Eye, AlertCircle,
} from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

// Types
interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalCustomers: number;
    totalProducts: number;
    totalReviews: number;
    avgRating: string;
  };
  ordersByStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  orderTrends: Array<{ label: string; orders: number; revenue: number }>;
  topProducts: Array<{ name: string; totalQuantity: number; totalRevenue: number }>;
  customerStats: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
  };
  reviewStats: {
    totalReviews: number;
    avgRating: string;
    ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
  paymentMethods: { cod: number; card: number; stripe: number };
  inventoryStats: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockValue: number;
  };
  growthStats: {
    orderGrowth: string;
    revenueGrowth: string;
    currentPeriodOrders: number;
    previousPeriodOrders: number;
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  iconBgColor 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string; 
  trendValue?: string; 
  iconBgColor: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        {trendValue && TrendIcon && (
          <div className={`flex items-center gap-1 text-[11px] font-bold ${trend === "up" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"} px-2 py-1 rounded-full`}>
            <TrendIcon size={12} />
            {trendValue}%
          </div>
        )}
      </div>
      <p className="text-[12px] font-medium text-gray-500">{title}</p>
      <p className="text-[24px] font-black text-gray-900 mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (dateRange.start && dateRange.end) {
        params.set("startDate", dateRange.start);
        params.set("endDate", dateRange.end);
      }
      const res = await fetch(`/api/admin/analytics?${params}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        console.error("API Error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange.start, dateRange.end]);

  // PDF Export with clean data tables
  const handleExportPDF = () => {
    if (!data) {
      alert("No data available to export");
      return;
    }

    setIsExporting(true);
    
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(0, 75, 156);
      doc.text("iSPORTS Analytics Report", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy HH:mm")}`, 20, 30);
      doc.text(`Period: ${period === "day" ? "Last 24 Hours" : period === "week" ? "Last 7 Days" : period === "month" ? "Last 30 Days" : "Last 12 Months"}`, 20, 37);
      if (dateRange.start && dateRange.end) {
        doc.text(`Custom Range: ${format(new Date(dateRange.start), "MMM dd, yyyy")} - ${format(new Date(dateRange.end), "MMM dd, yyyy")}`, 20, 44);
      }
      
      // Summary Section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Executive Summary", 20, 55);
      
      const summaryData = [
        ["Total Orders", data.summary.totalOrders.toString()],
        ["Total Revenue", `AED ${data.summary.totalRevenue.toLocaleString()}`],
        ["Average Order Value", `AED ${data.summary.averageOrderValue.toLocaleString()}`],
        ["Total Customers", data.summary.totalCustomers.toString()],
        ["Total Products", data.summary.totalProducts.toString()],
        ["Total Reviews", data.summary.totalReviews.toString()],
        ["Average Rating", data.summary.avgRating],
        ["Order Growth", `${data.growthStats.orderGrowth}%`],
        ["Revenue Growth", `${data.growthStats.revenueGrowth}%`],
      ];
      
      // @ts-ignore
      autoTable(doc, {
        startY: 60,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [0, 75, 156], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
      });
      
      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY + 10;
      
      // Orders by Status
      doc.text("Orders by Status", 20, finalY);
      const statusData = Object.entries(data.ordersByStatus).map(([status, count]) => [
        status.charAt(0).toUpperCase() + status.slice(1),
        count.toString(),
        `${((count / data.summary.totalOrders) * 100).toFixed(1)}%`,
      ]);
      
      // @ts-ignore
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Status", "Count", "Percentage"]],
        body: statusData,
        theme: "striped",
        headStyles: { fillColor: [0, 75, 156], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
      });
      
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 10;
      
      // Payment Methods
      doc.text("Payment Methods", 20, finalY);
      const paymentData = Object.entries(data.paymentMethods).map(([method, count]) => [
        method.toUpperCase(),
        count.toString(),
        `${((count / data.summary.totalOrders) * 100).toFixed(1)}%`,
      ]);
      
      // @ts-ignore
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Method", "Orders", "Percentage"]],
        body: paymentData,
        theme: "striped",
        headStyles: { fillColor: [0, 75, 156], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
      });
      
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (finalY > 180) {
        doc.addPage();
        finalY = 20;
      }
      
      // Rating Distribution
      doc.text("Rating Distribution", 20, finalY);
      const ratingData = Object.entries(data.reviewStats.ratingDistribution).map(([rating, count]) => [
        `${rating} Stars`,
        count.toString(),
        `${((count / data.reviewStats.totalReviews) * 100).toFixed(1)}%`,
      ]);
      
      // @ts-ignore
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Rating", "Count", "Percentage"]],
        body: ratingData,
        theme: "striped",
        headStyles: { fillColor: [0, 75, 156], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
      });
      
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 10;
      
      // Top Products
      if (finalY > 150) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.text("Top Selling Products", 20, finalY);
      const productsData = data.topProducts.slice(0, 15).map((p, idx) => [
        (idx + 1).toString(),
        p.name,
        p.totalQuantity.toString(),
        `AED ${p.totalRevenue.toLocaleString()}`,
        `${((p.totalRevenue / data.summary.totalRevenue) * 100).toFixed(1)}%`,
      ]);
      
      // @ts-ignore
      autoTable(doc, {
        startY: finalY + 5,
        head: [["#", "Product", "Quantity", "Revenue", "% of Total"]],
        body: productsData,
        theme: "striped",
        headStyles: { fillColor: [0, 75, 156], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
      });
      
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 10;
      
      // Customer & Inventory Stats
      if (finalY > 150) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.text("Customer & Inventory Insights", 20, finalY);
      
      const insightsData = [
        ["Total Customers", data.customerStats.totalCustomers.toString()],
        ["New Customers", data.customerStats.newCustomers.toString()],
        ["Returning Customers", data.customerStats.returningCustomers.toString()],
        ["Returning Customer Rate", `${((data.customerStats.returningCustomers / data.customerStats.totalCustomers) * 100).toFixed(1)}%`],
        ["Total Reviews", data.reviewStats.totalReviews.toString()],
        ["Average Rating", data.reviewStats.avgRating],
        ["Total Products", data.inventoryStats.totalProducts.toString()],
        ["Low Stock Products", data.inventoryStats.lowStockProducts.toString()],
        ["Out of Stock Products", data.inventoryStats.outOfStockProducts.toString()],
        ["Total Stock Value", `AED ${data.inventoryStats.totalStockValue.toLocaleString()}`],
      ];
      
      // @ts-ignore
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Metric", "Value"]],
        body: insightsData,
        theme: "striped",
        headStyles: { fillColor: [0, 75, 156], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
      });
      
      // Save PDF
      doc.save(`analytics-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      
    } catch (error) {
      console.error("PDF Export error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    
    const csvRows = [
      ["Metric", "Value"],
      ["Total Orders", data.summary.totalOrders],
      ["Total Revenue", data.summary.totalRevenue],
      ["Average Order Value", data.summary.averageOrderValue],
      ["Total Customers", data.summary.totalCustomers],
      ["Total Products", data.summary.totalProducts],
      ["Total Reviews", data.summary.totalReviews],
      ["Average Rating", data.summary.avgRating],
      ["Order Growth", `${data.growthStats.orderGrowth}%`],
      ["Revenue Growth", `${data.growthStats.revenueGrowth}%`],
      [],
      ["Orders by Status"],
      ["Status", "Count", "Percentage"],
      ...Object.entries(data.ordersByStatus).map(([status, count]) => [
        status.toUpperCase(),
        count,
        `${((count / data.summary.totalOrders) * 100).toFixed(1)}%`,
      ]),
      [],
      ["Payment Methods"],
      ["Method", "Orders", "Percentage"],
      ...Object.entries(data.paymentMethods).map(([method, count]) => [
        method.toUpperCase(),
        count,
        `${((count / data.summary.totalOrders) * 100).toFixed(1)}%`,
      ]),
      [],
      ["Rating Distribution"],
      ["Rating", "Count", "Percentage"],
      ...Object.entries(data.reviewStats.ratingDistribution).map(([rating, count]) => [
        `${rating} Stars`,
        count,
        `${((count / data.reviewStats.totalReviews) * 100).toFixed(1)}%`,
      ]),
      [],
      ["Top Products"],
      ["Product Name", "Quantity Sold", "Revenue", "% of Total"],
      ...data.topProducts.map(p => [
        p.name,
        p.totalQuantity,
        p.totalRevenue,
        `${((p.totalRevenue / data.summary.totalRevenue) * 100).toFixed(1)}%`,
      ]),
      [],
      ["Customer & Inventory Insights"],
      ["Metric", "Value"],
      ["Total Customers", data.customerStats.totalCustomers],
      ["New Customers", data.customerStats.newCustomers],
      ["Returning Customers", data.customerStats.returningCustomers],
      ["Returning Customer Rate", `${((data.customerStats.returningCustomers / data.customerStats.totalCustomers) * 100).toFixed(1)}%`],
      ["Total Reviews", data.reviewStats.totalReviews],
      ["Average Rating", data.reviewStats.avgRating],
      ["Total Products", data.inventoryStats.totalProducts],
      ["Low Stock Products", data.inventoryStats.lowStockProducts],
      ["Out of Stock Products", data.inventoryStats.outOfStockProducts],
      ["Total Stock Value", data.inventoryStats.totalStockValue],
    ];
    
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: "iSPORTS Analytics Report",
      text: `Analytics Report - ${format(new Date(), "MMMM dd, yyyy")}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No data available</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-[#004b9c] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusData = Object.entries(data.ordersByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name] || "#8884D8",
  }));

  const ratingData = Object.entries(data.reviewStats.ratingDistribution).map(([rating, count]) => ({
    name: `${rating} ★`,
    value: count,
  }));

  const paymentData = Object.entries(data.paymentMethods).map(([method, count]) => ({
    name: method.toUpperCase(),
    value: count,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">Analytics Dashboard</h1>
            <p className="text-gray-400 text-[13px] mt-1">
              {dateRange.start && dateRange.end 
                ? `${format(new Date(dateRange.start), "MMM dd, yyyy")} - ${format(new Date(dateRange.end), "MMM dd, yyyy")}`
                : `Last ${period === "day" ? "24 hours" : period === "week" ? "7 days" : period === "month" ? "30 days" : "12 months"}`
            }</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 bg-white focus:outline-none focus:border-[#004b9c]"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-[#004b9c]"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-[#004b9c]"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50"
              >
                <Share2 size={14} /> Share
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                  <button onClick={handleShare} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">Share Link</button>
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">Export CSV</button>
                </div>
              )}
            </div>
            
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004b9c] text-white text-[13px] font-bold hover:bg-[#003d82] transition-colors disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? "Generating PDF..." : "Export PDF"}
            </button>
            
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard
            title="Total Orders"
            value={data.summary.totalOrders}
            icon={<ShoppingBag size={18} className="text-white" />}
            trend={parseFloat(data.growthStats.orderGrowth) >= 0 ? "up" : "down"}
            trendValue={Math.abs(parseFloat(data.growthStats.orderGrowth)).toFixed(1)}
            iconBgColor="bg-blue-600"
          />
          <StatsCard
            title="Revenue"
            value={`AED ${data.summary.totalRevenue.toLocaleString()}`}
            icon={<DollarSign size={18} className="text-white" />}
            trend={parseFloat(data.growthStats.revenueGrowth) >= 0 ? "up" : "down"}
            trendValue={Math.abs(parseFloat(data.growthStats.revenueGrowth)).toFixed(1)}
            iconBgColor="bg-green-600"
          />
          <StatsCard
            title="Avg. Order Value"
            value={`AED ${data.summary.averageOrderValue.toLocaleString()}`}
            icon={<TrendingUp size={18} className="text-white" />}
            iconBgColor="bg-purple-600"
          />
          <StatsCard
            title="Customers"
            value={data.summary.totalCustomers}
            icon={<Users size={18} className="text-white" />}
            iconBgColor="bg-amber-600"
          />
          <StatsCard
            title="Products"
            value={data.summary.totalProducts}
            icon={<Package size={18} className="text-white" />}
            iconBgColor="bg-pink-600"
          />
          <StatsCard
            title="Avg. Rating"
            value={`★ ${data.summary.avgRating}`}
            icon={<Star size={18} className="text-white" />}
            iconBgColor="bg-yellow-600"
          />
        </div>

        {/* Revenue & Orders Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-black text-gray-900">Revenue Trend</h3>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.orderTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `AED ${v}`} />
                <Tooltip formatter={(v: any) => `AED ${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="#004b9c" fill="#004b9c" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-black text-gray-900">Orders Trend</h3>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.orderTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#81bf42" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-[16px] font-black text-gray-900 mb-6">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-[16px] font-black text-gray-900 mb-6">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-[16px] font-black text-gray-900 mb-6">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-black text-gray-900">Top Selling Products</h3>
            <Package size={20} className="text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-right py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider">Quantity Sold</th>
                  <th className="text-right py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-[13px] font-medium text-gray-800">{product.name}</td>
                    <td className="py-3 text-right text-[13px] text-gray-600">{product.totalQuantity}</td>
                    <td className="py-3 text-right text-[13px] font-bold text-[#004b9c]">AED {product.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 text-right text-[13px] text-gray-500">
                      {data.summary.totalRevenue > 0 ? ((product.totalRevenue / data.summary.totalRevenue) * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer & Inventory Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-[16px] font-black text-gray-900 mb-6">Customer Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Users size={24} className="text-blue-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-blue-600">{data.customerStats.totalCustomers}</p>
                <p className="text-[11px] text-gray-500">Total Customers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <TrendingUp size={24} className="text-green-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-green-600">{data.customerStats.newCustomers}</p>
                <p className="text-[11px] text-gray-500">New Customers</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <RefreshCw size={24} className="text-purple-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-purple-600">{data.customerStats.returningCustomers}</p>
                <p className="text-[11px] text-gray-500">Returning Customers</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <Star size={24} className="text-amber-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-amber-600">{data.reviewStats.totalReviews}</p>
                <p className="text-[11px] text-gray-500">Total Reviews</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-[16px] font-black text-gray-900 mb-6">Inventory Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Package size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-gray-800">{data.inventoryStats.totalProducts}</p>
                <p className="text-[11px] text-gray-500">Total Products</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <AlertCircle size={24} className="text-amber-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-amber-600">{data.inventoryStats.lowStockProducts}</p>
                <p className="text-[11px] text-gray-500">Low Stock (≤5)</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <AlertCircle size={24} className="text-red-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-red-600">{data.inventoryStats.outOfStockProducts}</p>
                <p className="text-[11px] text-gray-500">Out of Stock</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <DollarSign size={24} className="text-green-600 mx-auto mb-2" />
                <p className="text-[24px] font-black text-green-600">AED {data.inventoryStats.totalStockValue.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500">Total Stock Value</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}