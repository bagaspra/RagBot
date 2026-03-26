"use client";

import React, { useEffect, useState } from "react";
import { Info, Users, MessageSquare, TrendingUp, ExternalLink } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import StatCard from "@/components/admin/StatCard";
import { ThemeSelector } from "@/components/admin/ThemeSelector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_STYLES: Record<string, string> = {
  admin:  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  editor: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  viewer: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
};


function getAvatarColor(name: string): string {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-pink-500"];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

interface UserStatsData {
  total_queries: number;
  unique_users: number;
  avg_queries_per_user: number;
}

/** Admin Users page — shows real logged-in user + empty state. Stats from chat logs. */
export default function UsersPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<UserStatsData>({ total_queries: 0, unique_users: 0, avg_queries_per_user: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/users/stats", { cache: "no-store" });
        if (res.ok) setStats(await res.json());
      } catch { /* silent */ }
      finally { setIsLoadingStats(false); }
    }
    fetchStats();
  }, []);

  const realName = user ? (user.fullName ?? user.firstName ?? "You") : "You";
  const realEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const realRole = (user?.publicMetadata?.role as string | undefined) ?? "admin";
  const realInitials = realName.split(" ").slice(0, 2).map((p: string) => p[0]).join("").toUpperCase() || "U";

  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Activity overview for all chatbot users
          </p>
        </div>
        <a
          href="https://dashboard.clerk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
        >
          Manage in Clerk
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
        <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Showing your account with real data. Full user management available in{" "}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:no-underline"
          >
            Clerk Dashboard →
          </a>
        </p>
      </div>

      {/* Stats — real data from chat_logs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Unique Users"
          value={isLoadingStats ? "…" : stats.unique_users}
          icon={Users}
          iconBgColor="bg-blue-500"
        />
        <StatCard
          title="Total Queries"
          value={isLoadingStats ? "…" : stats.total_queries}
          icon={MessageSquare}
          iconBgColor="bg-violet-500"
        />
        <StatCard
          title="Avg Queries/User"
          value={isLoadingStats ? "…" : stats.avg_queries_per_user}
          icon={TrendingUp}
          iconBgColor="bg-emerald-500"
        />
      </div>

      {/* User Activity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">User Activity</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time data from Clerk and chat logs
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/30 dark:bg-slate-800/30">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Total Queries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Real logged-in user — first row */}
            {isLoaded && user && (
              <TableRow className="bg-blue-50/30 dark:bg-blue-900/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.imageUrl} alt={realName} className="size-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className={`size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(realName)}`}>
                        {realInitials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {realName}
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">You</span>
                      </p>
                      <p className="text-xs text-slate-400">{realEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLES[realRole] ?? ROLE_STYLES.viewer}`}>
                    {realRole}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Active</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500 dark:text-slate-400">Just now</TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  {stats.total_queries}
                </TableCell>
              </TableRow>
            )}

            {/* Empty state — no other users */}
            <tr>
              <td colSpan={5}>
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p className="text-sm">No other users yet.</p>
                  <p className="text-xs mt-1">
                    Invite users via the{" "}
                    <a
                      href="https://dashboard.clerk.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Clerk Dashboard
                    </a>
                    .
                  </p>
                </div>
              </td>
            </tr>
          </TableBody>
        </Table>
      </div>

      {/* Theme Preference Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Your Theme Preference</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          This setting is saved in your browser and applies to all admin pages.
        </p>
        <ThemeSelector />
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          Default is Light mode. Changes apply immediately and persist across sessions.
        </p>
      </div>
    </div>
  );
}
