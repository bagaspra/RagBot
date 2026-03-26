"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download } from "lucide-react";
import Button from "@/components/ui/button";
import ChatLogsStats from "@/components/admin/chat-logs/ChatLogsStats";
import ChatLogsFilters from "@/components/admin/chat-logs/ChatLogsFilters";
import ChatLogsTable from "@/components/admin/chat-logs/ChatLogsTable";

interface ChatLogEntry {
  id: string;
  user_id: string;
  query: string;
  answer: string;
  sources: string[];
  response_time_ms: number;
  timestamp: string;
  has_answer: boolean;
}

interface StatsData {
  total_queries: number;
  answered_count: number;
  unanswered_count: number;
  avg_response_ms: number;
  unique_users: number;
  queries_today: number;
}

const DEFAULT_STATS: StatsData = {
  total_queries: 0, answered_count: 0, unanswered_count: 0,
  avg_response_ms: 0, unique_users: 0, queries_today: 0,
};

const PAGE_SIZE = 20;

/** Admin Chat Logs page — shows all user queries with expandable details. */
export default function ChatLogsPage() {
  const [logs, setLogs] = useState<ChatLogEntry[]>([]);
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [answerFilter, setAnswerFilter] = useState<"all" | "answered" | "unanswered">("all");
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">("all");
  const [page, setPage] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat-logs/stats", { cache: "no-store" });
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "500", offset: "0" });
      const res = await fetch(`/api/admin/chat-logs?${params}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [fetchStats, fetchLogs]);

  // Client-side filtering
  const filtered = useMemo(() => {
    const now = new Date();
    return logs.filter((e) => {
      if (search && !e.query.toLowerCase().includes(search.toLowerCase())) return false;
      if (answerFilter === "answered" && !e.has_answer) return false;
      if (answerFilter === "unanswered" && e.has_answer) return false;
      if (dateRange !== "all") {
        const ts = new Date(e.timestamp);
        if (dateRange === "today") {
          if (ts.toDateString() !== now.toDateString()) return false;
        } else {
          const days = dateRange === "7d" ? 7 : 30;
          const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          if (ts < cutoff) return false;
        }
      }
      return true;
    });
  }, [logs, search, answerFilter, dateRange]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageLogs = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chat Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor all queries sent to the RAG chatbot
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Coming soon"
          className="gap-2"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <ChatLogsStats stats={stats} />

      {/* Table card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <ChatLogsFilters
          search={search} onSearchChange={(v) => { setSearch(v); setPage(0); }}
          answerFilter={answerFilter} onAnswerFilterChange={(v) => { setAnswerFilter(v); setPage(0); }}
          dateRange={dateRange} onDateRangeChange={(v) => { setDateRange(v); setPage(0); }}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <div className="animate-spin rounded-full size-8 border-2 border-slate-200 border-t-blue-500 mr-3" />
            <span className="text-sm font-medium">Loading logs...</span>
          </div>
        ) : (
          <ChatLogsTable logs={pageLogs} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-slate-100">{pageLogs.length}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">{filtered.length}</span> logs
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded-md disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded-md disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
