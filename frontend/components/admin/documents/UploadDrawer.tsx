"use client";

import React, { useState } from "react";
import Sheet from "@/components/ui/sheet-custom";
import UploadDropZone from "@/components/admin/documents/UploadDropZone";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface UploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadDrawer({ isOpen, onClose, onUploadComplete }: UploadDrawerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadStatus("uploading");
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/upload`, {
        method: "POST",
        headers: {
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("complete");
        onUploadComplete();
        // Keep drawer open briefly to show success
        setTimeout(() => {
          onClose();
          setUploadStatus("idle");
        }, 1500);
      } else {
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Upload Documents" 
      description="Add files to your RAG knowledge base. Background ingestion will start automatically."
    >
      <div className="space-y-6">
        <UploadDropZone onUpload={handleUpload} isUploading={isUploading} />

        {/* Global Progress Placeholder */}
        {isUploading && (
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">Overall Progress</span>
              <span className="text-xs text-blue-600 font-bold">Uploading...</span>
            </div>
            <Progress value={45} className="h-1.5" />
          </div>
        )}

        {/* Result Message */}
        {uploadStatus === "complete" && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
            <CheckCircle2 className="size-5" />
            <span className="text-sm font-medium">Upload successful! Processing has started.</span>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
            <AlertCircle className="size-5" />
            <span className="text-sm font-medium">Upload failed. Please check your connection or file sizes.</span>
          </div>
        )}
      </div>
    </Sheet>
  );
}
