"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "emerald" | "blue" | "amber" | "purple";
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  color = "emerald",
}: StatCardProps) => {
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const bgMap = {
    emerald: "hover:border-emerald-200 hover:shadow-emerald-100",
    blue: "hover:border-blue-200 hover:shadow-blue-100",
    amber: "hover:border-amber-200 hover:shadow-amber-100",
    purple: "hover:border-purple-200 hover:shadow-purple-100",
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm transition-all duration-300 ${bgMap[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            {trendUp ? "+" : "-"}{trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};
