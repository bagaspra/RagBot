"use client";

import React, { useEffect } from "react";
import { FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface StatsData {
  total_documents: number;
  indexed_count: number;
  processing_count: number;
  failed_count: number;
}

interface DocumentsStatsProps {
  stats: StatsData;
  onRefresh: () => void;
}

export default function DocumentsStats({ stats, onRefresh }: DocumentsStatsProps) {
  // Auto-refresh stats if something is processing
  useEffect(() => {
    if (stats.processing_count > 0) {
      const timer = setInterval(onRefresh, 10000);
      return () => clearInterval(timer);
    }
  }, [stats.processing_count, onRefresh]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Documents"
        value={stats.total_documents}
        icon={FileText}
        iconBgColor="bg-blue-500"
      />
      <StatCard
        title="Indexed"
        value={stats.indexed_count}
        trend="85%"
        trendType="positive"
        icon={CheckCircle2}
        iconBgColor="bg-emerald-500"
      />
      <StatCard
        title="Processing"
        value={stats.processing_count}
        icon={Loader2}
        iconBgColor="bg-amber-500"
      />
      <StatCard
        title="Failed"
        value={stats.failed_count}
        trend="2%"
        trendType="negative"
        icon={AlertCircle}
        iconBgColor="bg-red-500"
      />
    </div>
  );
}
