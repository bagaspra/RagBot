"use client";

import React, { useState, useEffect, useCallback } from "react";
import DocumentsPageHeader from "@/components/admin/documents/DocumentsPageHeader";
import DocumentsStats from "@/components/admin/documents/DocumentsStats";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";
import UploadDrawer from "@/components/admin/documents/UploadDrawer";

interface DocumentRecord {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  uploaded_at: string;
  status: "processing" | "indexed" | "failed";
  chunk_count: number;
  error_message?: string;
}

export default function DocumentsPage() {
  const [stats, setStats] = useState({
    total_documents: 0,
    indexed_count: 0,
    processing_count: 0,
    failed_count: 0,
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReindexingAll, setIsReindexingAll] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: {
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents`, {
        headers: {
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchDocuments();
  }, [fetchStats, fetchDocuments]);

  const handleUploadComplete = () => {
    fetchStats();
    fetchDocuments();
  };

  const handleReindexAll = async () => {
    setIsReindexingAll(true);
    // Logic for reindexing all documents
    // This might be a loop over all documents or a single bulk endpoint
    setTimeout(() => {
      setIsReindexingAll(false);
      fetchStats();
      fetchDocuments();
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-2">
      <DocumentsPageHeader 
        onUploadClick={() => setIsDrawerOpen(true)} 
        onReindexAll={handleReindexAll}
        isReindexing={isReindexingAll}
      />
      
      <DocumentsStats stats={stats} onRefresh={fetchStats} />
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <DocumentsTable 
          documents={documents} 
          isLoading={isLoading} 
          onRefresh={fetchDocuments}
        />
      </div>

      <UploadDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
