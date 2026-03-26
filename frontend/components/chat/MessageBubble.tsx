"use client";

import React from "react";
import { Bot } from "lucide-react";

import type { Message } from "@/types";

import SourcesAccordion from "./SourcesAccordion";

/**
 * Format a timestamp to a human-friendly time string.
 */
function formatTimestamp(ts: Date): string {
  const date = ts instanceof Date ? ts : new Date(ts);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

/**
 * Render a single chat message bubble (user or assistant).
 */
export default function MessageBubble(props: { message: Message }) {
  const { message } = props;

  const timeLabel = formatTimestamp(message.timestamp);
  const streamingCursor = message.isStreaming ? (
    <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
  ) : null;

  if (message.role === "user") {
    const initials = "U";
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-row-reverse items-end gap-3 max-w-[75%]">
          <div className="min-w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-sm whitespace-pre-wrap text-sm leading-relaxed break-words">
            {message.content}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{timeLabel}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 max-w-[85%]">
      <div className="flex flex-row items-end gap-3">
        <div className="min-w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div className="bg-muted text-foreground px-4 py-2.5 rounded-2xl rounded-bl-sm whitespace-pre-wrap text-sm leading-relaxed break-words">
          {message.content}
          {streamingCursor}
        </div>
      </div>

      {message.sources.length > 0 ? <SourcesAccordion sources={message.sources} /> : null}

      <div className="text-xs text-muted-foreground ml-9">{timeLabel}</div>
    </div>
  );
}

