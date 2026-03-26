"use client";

import React from "react";
import AlertDialog from "@/components/ui/alert-dialog-custom";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  filename: string;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  filename
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog 
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Document?"
      description={`Are you sure you want to delete "${filename}"? This action cannot be undone. The file will be removed from storage and all indexed vectors will be deleted from Qdrant.`}
      confirmText="Delete Permanently"
      isDestructive
    />
  );
}
