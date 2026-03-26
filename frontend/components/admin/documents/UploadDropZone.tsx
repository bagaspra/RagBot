"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, CheckCircle2, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
}

export default function UploadDropZone({ onUpload, isUploading }: UploadDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
    }
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    await onUpload(files);
    setFiles([]); // Clear after upload
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="bg-white p-3 rounded-full shadow-sm mb-4 border border-slate-100">
          <Upload className="size-6 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-900">
          {isDragActive ? "Drop the files here" : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          PDF, DOCX, TXT, or XLSX (max. 50MB per file)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto px-4 py-2 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-900 truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(i)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
