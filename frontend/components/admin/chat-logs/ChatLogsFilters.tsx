"use client";

import React from "react";
import { Search } from "lucide-react";

interface ChatLogsFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  answerFilter: "all" | "answered" | "unanswered";
  onAnswerFilterChange: (v: "all" | "answered" | "unanswered") => void;
  dateRange: "today" | "7d" | "30d" | "all";
  onDateRangeChange: (v: "today" | "7d" | "30d" | "all") => void;
}

/** Filter bar for the Chat Logs table: search input + answered/unanswered + date range. */
export default function ChatLogsFilters({
  search, onSearchChange,
  answerFilter, onAnswerFilterChange,
  dateRange, onDateRangeChange,
}: ChatLogsFiltersProps) {
  return (
    <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
      <div className="relative flex-1 min-w-[260px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search queries..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          value={answerFilter}
          onChange={(e) => onAnswerFilterChange(e.target.value as "all" | "answered" | "unanswered")}
          className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          <option value="all">All Queries</option>
          <option value="answered">Answered</option>
          <option value="unanswered">Unanswered</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as "today" | "7d" | "30d" | "all")}
          className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>
    </div>
  );
}
