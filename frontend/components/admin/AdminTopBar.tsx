"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, ArrowLeft } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

export default function AdminTopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Generate breadcrumbs from pathname
  // e.g., /admin/documents -> Admin > Documents
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);

    return (
      <React.Fragment key={segment}>
        <span className={isLast ? "text-slate-900 font-medium" : "text-slate-500"}>
          {title}
        </span>
        {!isLast && <ChevronRight className="size-3.5 text-slate-300 mx-1" />}
      </React.Fragment>
    );
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between">
      {/* LEFT: Breadcrumbs */}
      <div className="flex items-center text-sm">
        {breadcrumbs}
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 border-2 border-white rounded-full" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Back to Chat */}
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <ArrowLeft className="size-4" />
            Back to Chat
          </Button>
        </Link>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* User Button */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
            {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
