"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  X,
  FileText
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { toast } from "sonner";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  uploaded_at: string;
  status: "processing" | "indexed" | "failed";
  chunk_count: number;
  error_message?: string;
}

interface DocumentsTableProps {
  documents: Document[];
  isLoading: boolean;
  onRefresh: () => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function DocumentsTable({ documents, isLoading, onRefresh }: DocumentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [reindexingIds, setReindexingIds] = useState<Set<string>>(new Set());

  // Auto-refresh if any doc is processing
  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === "processing");
    if (hasProcessing) {
      const timer = setInterval(onRefresh, 5000);
      return () => clearInterval(timer);
    }
  }, [documents, onRefresh]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
      const matchesType = typeFilter === "all" || doc.file_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, searchTerm, statusFilter, typeFilter]);

  const toggleSelect = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocs.length === filteredDocs.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocs.map(d => d.id));
    }
  };

  const handleDelete = async () => {
    if (!deleteDocId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${deleteDocId}`, {
        method: "DELETE",
        headers: {
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });
      if (response.ok) {
        toast.success("Document deleted successfully.");
        onRefresh();
      } else {
        toast.error("Failed to delete document.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Delete failed. Please try again.");
    } finally {
      setDeleteDocId(null);
    }
  };

  const handleReindex = async (id: string) => {
    if (reindexingIds.has(id)) return;
    setReindexingIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${id}/reindex`, {
        method: "POST",
        headers: {
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });
      if (response.ok) {
        toast.success("Re-indexing started successfully.");
        onRefresh();
      } else {
        toast.error("Failed to start re-indexing.");
      }
    } catch (error) {
      console.error("Reindex failed:", error);
      toast.error("Re-index failed. Please try again.");
    } finally {
      setReindexingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50">
        <Inbox className="size-12 mb-4 opacity-20" />
        <p className="text-base font-semibold text-slate-900">No documents found</p>
        <p className="text-sm mt-1 max-w-[280px] text-center">
          Upload your first document to start building your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table Toolbar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="indexed">Indexed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="xlsx">XLSX</option>
          </select>
        </div>

        {selectedDocs.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-bold">{selectedDocs.length} selected</span>
            <div className="w-px h-4 bg-blue-200 mx-1" />
            <button className="text-xs font-bold hover:underline" onClick={() => {}}>Delete Bulk</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/30">
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.map((doc) => (
              <TableRow key={doc.id} className="group transition-colors">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => toggleSelect(doc.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {doc.filename}
                    </span>
                    <span className="text-[10px] text-slate-400">ID: {doc.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    {doc.file_type}
                  </span>
                </TableCell>
                <TableCell className="text-slate-500 text-xs tabular-nums">
                  {formatBytes(doc.file_size_bytes)}
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                    doc.status === "indexed" && "bg-emerald-50 text-emerald-600",
                    doc.status === "processing" && "bg-amber-50 text-amber-600",
                    doc.status === "failed" && "bg-red-50 text-red-600",
                  )}>
                    {doc.status === "processing" && <Clock className="size-3 animate-pulse" />}
                    {doc.status === "indexed" && <CheckCircle2 className="size-3" />}
                    {doc.status === "failed" && <AlertCircle className="size-3" />}
                    {doc.status}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 text-xs">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Preview */}
                    <button
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Preview"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="size-4" />
                    </button>
                    {/* Re-index */}
                    <button
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Re-index"
                      disabled={reindexingIds.has(doc.id)}
                      onClick={() => handleReindex(doc.id)}
                    >
                      {reindexingIds.has(doc.id)
                        ? <Loader2 className="size-4 animate-spin" />
                        : <RefreshCw className="size-4" />
                      }
                    </button>
                    {/* Delete */}
                    <button
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete"
                      onClick={() => setDeleteDocId(doc.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Placeholder */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{filteredDocs.length}</span> of <span className="text-slate-900 font-bold">{documents.length}</span> documents
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDelete}
        filename={documents.find(d => d.id === deleteDocId)?.filename || ""}
      />

      {/* Document Preview Dialog */}
      <Dialog.Root open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FileText className="size-4 text-blue-600" />
                  </div>
                  <Dialog.Title className="text-base font-bold text-slate-900">
                    Document Details
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Body */}
              {previewDoc && (
                <div className="px-6 py-5 space-y-3">
                  {[
                    { label: "Filename", value: previewDoc.filename },
                    { label: "File Type", value: previewDoc.file_type.toUpperCase() },
                    { label: "File Size", value: formatBytes(previewDoc.file_size_bytes) },
                    { label: "Status", value: previewDoc.status.charAt(0).toUpperCase() + previewDoc.status.slice(1) },
                    { label: "Chunks", value: previewDoc.chunk_count.toString() },
                    { label: "Uploaded", value: new Date(previewDoc.uploaded_at).toLocaleString() },
                    { label: "Document ID", value: previewDoc.id, mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 w-24">{label}</span>
                      <span className={cn(
                        "text-sm text-slate-900 text-right break-all",
                        mono && "font-mono text-xs text-slate-500"
                      )}>{value}</span>
                    </div>
                  ))}
                  {previewDoc.error_message && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs font-semibold text-red-600 mb-1">Error</p>
                      <p className="text-xs text-red-500">{previewDoc.error_message}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Dialog.Close asChild>
                  <Button variant="outline" size="sm">Close</Button>
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
