"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ChatLogsTableProps {
  logs: ChatLogEntry[];
}

function getInitials(userId: string): string {
  if (userId === "anonymous") return "?";
  const parts = userId.split(/[@._-]/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function getAvatarColor(userId: string): string {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-pink-500","bg-indigo-500"];
  if (userId === "anonymous") return "bg-slate-400";
  let hash = 0;
  for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function formatResponseTime(ms: number): { label: string; color: string } {
  const s = ms / 1000;
  const label = `${s.toFixed(1)}s`;
  if (s < 2) return { label, color: "text-emerald-600 dark:text-emerald-400" };
  if (s < 4) return { label, color: "text-amber-600 dark:text-amber-400" };
  return { label, color: "text-red-600 dark:text-red-400" };
}

/** Expandable chat log row. Click ChevronDown to reveal full Q&A + metadata. */
function ChatLogRow({ entry }: { entry: ChatLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const initials = getInitials(entry.user_id);
  const avatarColor = getAvatarColor(entry.user_id);
  const rt = formatResponseTime(entry.response_time_ms);
  const ts = new Date(entry.timestamp);

  return (
    <>
      <tr className="group border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
        {/* User */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={cn("size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", avatarColor)}>
              {initials}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[90px]" title={entry.user_id}>
              {entry.user_id === "anonymous" ? "Anonymous" : entry.user_id}
            </span>
          </div>
        </td>
        {/* Query */}
        <td className="px-4 py-3 max-w-xs">
          <p className="text-sm text-slate-900 dark:text-slate-100 truncate">{entry.query}</p>
        </td>
        {/* Sources */}
        <td className="px-4 py-3">
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
            entry.sources.length > 0
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          )}>
            {entry.sources.length} source{entry.sources.length !== 1 ? "s" : ""}
          </span>
        </td>
        {/* Response Time */}
        <td className={cn("px-4 py-3 font-mono text-xs tabular-nums", rt.color)}>
          {rt.label}
        </td>
        {/* Answered */}
        <td className="px-4 py-3">
          {entry.has_answer ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              Answered
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              No answer found
            </span>
          )}
        </td>
        {/* Timestamp */}
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-700 dark:text-slate-300">{ts.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="text-[10px] text-slate-400">{ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </td>
        {/* Expand action */}
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-100 dark:border-slate-700">
          <td colSpan={7} className="px-6 py-5 bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT: Q&A */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Question</p>
                  <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{entry.query}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Answer</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{entry.answer}</p>
                </div>
              </div>
              {/* RIGHT: Metadata */}
              <div className="lg:w-64 shrink-0 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Sources Used</p>
                  {entry.sources.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.sources.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] font-medium border border-blue-100 dark:border-blue-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No sources</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Metadata</p>
                  <dl className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Response time</dt>
                      <dd className={cn("font-mono font-medium", rt.color)}>{rt.label}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">User ID</dt>
                      <dd className="text-slate-600 dark:text-slate-400 font-mono truncate max-w-[120px]">{entry.user_id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Log ID</dt>
                      <dd className="text-slate-600 dark:text-slate-400 font-mono truncate max-w-[120px]">{entry.id.slice(0, 8)}…</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Timestamp</dt>
                      <dd className="text-slate-600 dark:text-slate-400">{ts.toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/** Paginated table of chat logs with expandable rows. */
export default function ChatLogsTable({ logs }: ChatLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <MessageSquare className="size-12 mb-4 opacity-20" />
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">No chat logs yet</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 text-center max-w-[280px]">
          Logs will appear here once users start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Query</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sources</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Response Time</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Answered</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timestamp</th>
            <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((entry) => (
            <ChatLogRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
