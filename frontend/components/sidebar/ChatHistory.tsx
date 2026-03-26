"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

import { useChatStore } from "@/store/chatStore";

/**
 * Sidebar list of recent chat sessions.
 */
export default function ChatHistory() {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const setActiveSessionId = useChatStore((s) => s.setActiveSessionId);
  const clearSession = useChatStore((s) => s.clearSession);

  return (
    <div className="pt-2">
      <div className="px-2 pb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Recent Chats
      </div>

      <div className="space-y-1">
        {sessions.length === 0 ? (
          <div className="px-3 py-3 text-sm text-muted-foreground">No chats yet.</div>
        ) : null}

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const createdAt = session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt);
          const relative = formatDistanceToNow(createdAt, { addSuffix: true });

          return (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveSessionId(session.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setActiveSessionId(session.id);
              }}
              className={[
                "group flex items-center justify-between gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors",
                "hover:bg-muted/50",
                isActive ? "border-l-2 border-primary-container pl-[11px]" : "border-l-2 border-transparent pl-[11px]",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{session.title}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{relative}</div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-error"
                aria-label={`Delete ${session.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

