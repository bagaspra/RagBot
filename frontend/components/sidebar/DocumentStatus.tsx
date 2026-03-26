"use client";

import React from "react";

import { useHealthCheck } from "@/hooks/useHealthCheck";

/**
 * Display backend health and (future) document indexing status.
 */
export default function DocumentStatus() {
  const { backendStatus } = useHealthCheck();

  const isOnline = backendStatus === "online";

  return (
    <div className="bg-muted/40 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Document Sync</div>
        <div
          className={[
            "w-2 h-2 rounded-full",
            isOnline ? "bg-green-500" : "bg-red-500",
          ].join(" ")}
          aria-label={isOnline ? "Backend online" : "Backend offline"}
        />
      </div>
      <div className="text-sm font-semibold text-foreground">{isOnline ? "Backend Online" : "Backend Offline"}</div>
      <div className="text-xs text-muted-foreground mt-2">4 docs indexed</div>
    </div>
  );
}

