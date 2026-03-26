import React from "react";
import { MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

interface ChatLogStatsData {
  total_queries: number;
  answered_count: number;
  unanswered_count: number;
  avg_response_ms: number;
  unique_users: number;
  queries_today: number;
}

interface ChatLogsStatsProps {
  stats: ChatLogStatsData;
}

/** Row of 4 stat cards summarising chat log metrics. */
export default function ChatLogsStats({ stats }: ChatLogsStatsProps) {
  const avgSec = (stats.avg_response_ms / 1000).toFixed(2);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Queries"
        value={stats.total_queries}
        icon={MessageSquare}
        iconBgColor="bg-blue-500"
        trend={`${stats.queries_today} today`}
        trendType="neutral"
      />
      <StatCard
        title="Answered"
        value={stats.answered_count}
        icon={CheckCircle2}
        iconBgColor="bg-emerald-500"
      />
      <StatCard
        title="Unanswered"
        value={stats.unanswered_count}
        icon={XCircle}
        iconBgColor="bg-amber-500"
      />
      <StatCard
        title="Avg Response Time"
        value={`${avgSec}s`}
        icon={Clock}
        iconBgColor="bg-purple-500"
      />
    </div>
  );
}
