"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, User } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/whatsapp": "WhatsApp",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin";

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      {/* Left: Page title */}
      <div>
        <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        <p className="text-[11px] text-gray-400 font-medium">
          iSports Cricket Admin Panel
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search
            className="absolute left-3 text-gray-400 pointer-events-none"
            size={14}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-[13px] placeholder-gray-400 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#004b9c] hover:border-[#004b9c] transition-all">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#004b9c] flex items-center justify-center">
            <User size={15} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-[12px] font-bold text-gray-800 leading-tight">
              Admin
            </p>
            <p className="text-[10px] text-gray-400">
              admin@isportscricket.com
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
