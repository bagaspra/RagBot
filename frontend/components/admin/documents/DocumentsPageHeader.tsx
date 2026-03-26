"use client";

import React from "react";
import { Plus, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/button";

interface DocumentsPageHeaderProps {
  onUploadClick: () => void;
  onReindexAll: () => void;
  isReindexing?: boolean;
}

export default function DocumentsPageHeader({
  onUploadClick,
  onReindexAll,
  isReindexing = false
}: DocumentsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your knowledge base files and vector indexing status.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onReindexAll}
          disabled={isReindexing}
        >
          <RefreshCcw className={isReindexing ? "size-4 animate-spin" : "size-4"} />
          Re-index All
        </Button>
        <Button 
          size="sm" 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm shadow-blue-200"
          onClick={onUploadClick}
        >
          <Plus className="size-4" />
          Upload Documents
        </Button>
      </div>
    </div>
  );
}
