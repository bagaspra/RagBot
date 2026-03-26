"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Database,
  Cpu,
  Activity
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface StatsData {
  total_documents: number;
  indexed_count: number;
  processing_count: number;
  failed_count: number;
  total_size_bytes: number;
  total_chunks: number;
  qdrant_status: string;
  groq_status: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: {
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your RAG engine health and document processing metrics.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Documents"
          value={stats.total_documents}
          icon={FileText}
          iconBgColor="bg-blue-500"
        />
        <StatCard
          title="Total Chunks"
          value={stats.total_chunks.toLocaleString()}
          trend="Stable"
          trendType="neutral"
          icon={Database}
          iconBgColor="bg-indigo-500"
        />
        <StatCard
          title="Success Rate"
          value={`${((stats.indexed_count / (stats.total_documents || 1)) * 100).toFixed(1)}%`}
          trend="High"
          trendType="positive"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500"
        />
        <StatCard
          title="Active Workers"
          value={stats.processing_count > 0 ? 1 : 0}
          icon={Activity}
          iconBgColor="bg-amber-500"
        />
      </div>

      {/* Infrastructure Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="size-4 text-slate-500" />
            Core Infrastructure
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Qdrant Vector DB</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                {stats.qdrant_status}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Groq LLM API</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                {stats.groq_status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="size-4 text-slate-500" />
            Storage Usage
          </h2>
          <div className="flex flex-col items-center justify-center h-full py-4 text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {(stats.total_size_bytes / 1024 / 1024).toFixed(2)} MB
            </div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
              Total Managed Files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
