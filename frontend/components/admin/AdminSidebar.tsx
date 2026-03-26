"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BrainCircuit
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Chat Logs", href: "/admin/chat-logs", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-[240px] bg-[#0F172A] text-[#94A3B8] flex flex-col h-screen border-r border-slate-800">
      {/* TOP: Logo Area */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BrainCircuit className="size-5 text-white" />
          </div>
          <span className="text-white text-base font-medium">RAG Admin</span>
        </div>

        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Document Management
        </div>
        <div className="h-px bg-slate-800 w-full mb-4" />
      </div>

      {/* NAV ITEMS */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ease-in-out",
                isActive
                  ? "bg-white/10 text-white border-l-2 border-primary rounded-l-none"
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "size-5",
                isActive ? "text-blue-500" : "text-slate-400 group-hover:text-white"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div className="p-4 mt-auto">
        <div className="h-px bg-slate-800 w-full mb-4" />

        {/* System Status */}
        <div className="flex items-center gap-2 px-3 mb-6">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-slate-400">All systems operational</span>
        </div>

        {/* User Row */}
        <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="text-[11px] font-medium text-white truncate">
                {session?.user?.name ?? "Admin"}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
