"use client";

import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function AlertDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  confirmText = "Confirm",
  isDestructive = false
}: AlertDialogProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2.5 rounded-full",
              isDestructive ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              <AlertTriangle className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              className={cn(
                "px-4",
                isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
