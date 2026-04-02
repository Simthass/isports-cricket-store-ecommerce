"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { SORT_OPTIONS } from "@/constants/products";

interface Props {
  total: number;
  sort: string;
  onSort: (v: string) => void;
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
}

export default function ShopHeader({
  total,
  sort,
  onSort,
  view,
  onView,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-b border-gray-100 mb-8">
      <p className="text-[13px] text-gray-500 font-medium">
        Showing <span className="text-gray-900 font-bold">{total}</span>{" "}
        products
      </p>

      <div className="flex items-center gap-3">
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1">
          <button
            onClick={() => onView("grid")}
            className={`p-2 rounded-lg transition-all duration-150 ${
              view === "grid"
                ? "bg-white shadow-sm text-[#004b9c]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onView("list")}
            className={`p-2 rounded-lg transition-all duration-150 ${
              view === "list"
                ? "bg-white shadow-sm text-[#004b9c]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
