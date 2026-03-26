import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBgColor: string;
}

export default function StatCard({
  title,
  value,
  trend,
  trendType = "neutral",
  icon: Icon,
  iconBgColor
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
            {value}
          </h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className={cn(
                "text-xs font-medium",
                trendType === "positive" && "text-emerald-500",
                trendType === "negative" && "text-red-500",
                trendType === "neutral" && "text-slate-500"
              )}>
                {trendType === "positive" && "+"}
                {trendType === "negative" && "-"}
                {trend}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">vs last month</span>
            </div>
          )}
        </div>

        <div className={cn(
          "p-2.5 rounded-lg text-white",
          iconBgColor
        )}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
