"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import SettingsSection from "@/components/admin/settings/SettingsSection";
import { ThemeSelector } from "@/components/admin/ThemeSelector";
import AlertDialog from "@/components/ui/alert-dialog-custom";
import { cn } from "@/lib/utils";

interface RagSettings {
  top_k: number;
  score_threshold: number;
  strict_mode: boolean;
  show_sources: boolean;
  max_query_length: number;
}

const DEFAULT_SETTINGS: RagSettings = {
  top_k: 3,
  score_threshold: 0.70,
  strict_mode: true,
  show_sources: true,
  max_query_length: 500,
};

/** Simple toggle switch component. */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

/** A single settings row with label + description on the left, control on the right. */
function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Admin Settings page — configure RAG pipeline and system behaviour. */
export default function SettingsPage() {
  const [ragSettings, setRagSettings] = useState<RagSettings>(DEFAULT_SETTINGS);
  const [isSavingRag, setIsSavingRag] = useState(false);
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/rag`, {
        headers: { "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "" },
        cache: "no-store",
      });
      if (res.ok) setRagSettings(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveRagSettings = async () => {
    setIsSavingRag(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: JSON.stringify(ragSettings),
      });
      if (res.ok) {
        toast.success("RAG settings saved successfully.");
      } else {
        toast.error("Failed to save RAG settings.");
      }
    } catch {
      toast.error("Failed to save RAG settings.");
    } finally {
      setIsSavingRag(false);
    }
  };

  const saveSystemSettings = async () => {
    setIsSavingSystem(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: JSON.stringify(ragSettings),
      });
      if (res.ok) {
        toast.success("System settings saved successfully.");
      } else {
        toast.error("Failed to save system settings.");
      }
    } catch {
      toast.error("Failed to save system settings.");
    } finally {
      setIsSavingSystem(false);
    }
  };

  const handleClearVectors = async () => {
    if (clearConfirmText !== "CLEAR") return;
    setIsClearing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/clear-vectors`, {
        method: "POST",
        headers: { "X-Admin-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "" },
      });
      const data = await res.json();
      if (data.cleared) {
        toast.success(`Cleared ${data.chunks_deleted ?? 0} chunks from Qdrant.`);
      } else {
        toast.error(data.error ?? "Failed to clear vectors.");
      }
    } catch {
      toast.error("Failed to clear vectors.");
    } finally {
      setIsClearing(false);
      setClearDialogOpen(false);
      setClearConfirmText("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure the RAG chatbot system</p>
      </div>

      {/* SECTION 1 — Appearance */}
      <SettingsSection title="Appearance">
        <SettingsRow
          label="Interface Theme"
          description="Choose how the admin dashboard looks"
        >
          <ThemeSelector />
        </SettingsRow>
      </SettingsSection>

      {/* SECTION 2 — RAG Configuration */}
      <SettingsSection title="RAG Configuration">
        {/* Warning banner */}
        <div className="mx-6 mt-4 flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Changes to these settings affect all users immediately.
          </p>
        </div>

        <SettingsRow
          label="LLM Model"
          description="Groq model used for generating answers"
        >
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              llama-3.1-8b-instant
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              <a href="#" className="hover:underline">Change in .env file →</a>
            </p>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Retrieved Chunks (k)"
          description="Number of document chunks sent to LLM per query. Higher = more context, slower response."
        >
          <input
            type="number"
            min={1}
            max={10}
            value={ragSettings.top_k}
            onChange={(e) => setRagSettings((s) => ({ ...s, top_k: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }))}
            className="w-20 text-center text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </SettingsRow>

        <SettingsRow
          label="Similarity Threshold"
          description="Minimum relevance score for a chunk to be included. Higher = stricter, fewer false sources."
        >
          <div className="text-right">
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={ragSettings.score_threshold}
              onChange={(e) => setRagSettings((s) => ({ ...s, score_threshold: Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)) }))}
              className="w-20 text-center text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">0.0 (all) → 1.0 (exact match)</p>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Chunk Size"
          description="Token size for document splitting. Requires re-indexing all documents to take effect."
        >
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              500 tokens
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              <a href="#" className="hover:underline">Change in .env file →</a>
            </p>
          </div>
        </SettingsRow>

        <div className="px-6 py-4">
          <button
            onClick={saveRagSettings}
            disabled={isSavingRag}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingRag ? "Saving…" : "Save RAG Settings"}
          </button>
        </div>
      </SettingsSection>

      {/* SECTION 3 — System */}
      <SettingsSection title="System">
        <SettingsRow
          label="Strict Answer Mode"
          description="When enabled, the chatbot will ONLY answer from indexed documents. It will refuse to answer general knowledge questions."
        >
          <Toggle
            checked={ragSettings.strict_mode}
            onChange={(v) => setRagSettings((s) => ({ ...s, strict_mode: v }))}
          />
        </SettingsRow>

        <SettingsRow
          label="Show Source Citations"
          description="Display which documents were used to generate each answer in the chat UI."
        >
          <Toggle
            checked={ragSettings.show_sources}
            onChange={(v) => setRagSettings((s) => ({ ...s, show_sources: v }))}
          />
        </SettingsRow>

        <SettingsRow
          label="Max Query Length"
          description="Maximum characters allowed per user query."
        >
          <input
            type="number"
            min={1}
            max={2000}
            value={ragSettings.max_query_length}
            onChange={(e) => setRagSettings((s) => ({ ...s, max_query_length: Math.min(2000, Math.max(1, parseInt(e.target.value) || 1)) }))}
            className="w-24 text-center text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </SettingsRow>

        <div className="px-6 py-4">
          <button
            onClick={saveSystemSettings}
            disabled={isSavingSystem}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingSystem ? "Saving…" : "Save System Settings"}
          </button>
        </div>
      </SettingsSection>

      {/* SECTION 4 — Danger Zone */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900">
          <h2 className="text-sm font-bold text-red-600 dark:text-red-500">Danger Zone</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <SettingsRow
            label="Clear Vector Database"
            description="Permanently delete ALL indexed vectors from Qdrant. Documents in /data/ will NOT be deleted, but must be re-indexed."
          >
            <button
              onClick={() => setClearDialogOpen(true)}
              className="px-4 py-2 text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Clear Qdrant
            </button>
          </SettingsRow>
        </div>
      </div>

      {/* Clear Vectors Confirmation Dialog */}
      {clearDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => { setClearDialogOpen(false); setClearConfirmText(""); }}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Clear all vectors?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    This will delete all document chunks from Qdrant. The chat will stop working until you re-index your documents. <strong>This cannot be undone.</strong>
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  Type <span className="font-mono font-bold text-red-600">CLEAR</span> to confirm
                </label>
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="CLEAR"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setClearDialogOpen(false); setClearConfirmText(""); }}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearVectors}
                  disabled={clearConfirmText !== "CLEAR" || isClearing}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isClearing ? "Deleting…" : "Delete All Vectors"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
