"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { useChat } from "@/hooks/useChat";

/**
 * Auto-resizing chat input with streaming-aware submit button.
 */
export default function ChatInput() {
  const { sendMessage, isStreaming } = useChat();

  const [value, setValue] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const trimmed = useMemo(() => value.trim(), [value]);
  const canSend = trimmed.length > 0 && !isStreaming;

  /**
   * Adjust textarea height to fit content, capped at 5 rows.
   */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Reset first so shrinking works as the user deletes.
    el.style.height = "auto";

    const computed = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(computed.lineHeight || "20");
    const maxHeight = Math.max(0, lineHeight * 5);

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  /**
   * Submit the current input to the chat backend.
   */
  function handleSend(): void {
    if (!canSend) return;
    const query = trimmed;
    setValue("");
    void sendMessage(query);
  }

  /**
   * Handle Enter key submission while allowing Shift+Enter newline.
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    handleSend();
  }

  return (
    <div className="px-6 py-3">
      <div className="max-w-4xl mx-auto relative group">
        <div className="bg-muted/30 rounded-xl border border-border p-3 transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground resize-none min-h-[44px] max-h-[160px] overflow-y-auto text-sm leading-relaxed p-0"
              disabled={isStreaming}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="bg-primary text-primary-foreground w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isStreaming ? (
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/70 border-t-white animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/80 mt-3 uppercase tracking-[0.12em] font-semibold">
            Answers based on indexed documents only
          </p>
        </div>
      </div>
    </div>
  );
}

