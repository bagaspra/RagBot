"use client";

import React, { useMemo } from "react";
import { Download, Trash2 } from "lucide-react";

import { useChat } from "@/hooks/useChat";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useChatStore } from "@/store/chatStore";
import type { ChatSession, Message } from "@/types";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";

import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

/**
 * Main chat container. Hosts the message list and the chat input.
 */
export default function ChatWindow() {
  const { sendMessage, isStreaming } = useChat();
  const { backendStatus } = useHealthCheck();

  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const clearSession = useChatStore((s) => s.clearSession);

  const activeSession: ChatSession | null = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find((s) => s.id === activeSessionId) ?? null;
  }, [activeSessionId, sessions]);

  const title = activeSession?.title ?? "New Chat";
  const messages: Message[] = activeSession?.messages ?? [];

  /**
   * Export the active chat session as a JSON file.
   */
  const exportSession = async (): Promise<void> => {
    if (!activeSession) return;
    const blob = new Blob([JSON.stringify(activeSession, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSession.title.replace(/[^\w-]+/g, "_").slice(0, 40) || "chat"}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const backendBadgeLabel =
    backendStatus === "online" ? "● Online" : backendStatus === "offline" ? "● Offline" : "● Checking";

  const examples = [
    "What is the remote work policy?",
    "How do I submit an expense report?",
    "When does health insurance renew?",
  ];

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-0px)] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/70 backdrop-blur border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-foreground truncate">{title}</h2>
            <Badge variant="secondary" className="bg-primary-container/10 text-primary">
              {backendBadgeLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-foreground hover:text-primary"
              onClick={() => void exportSession()}
              disabled={!activeSession}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-foreground hover:text-error"
              onClick={() => activeSessionId && clearSession(activeSessionId)}
              disabled={!activeSessionId}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
            <div className="text-5xl">🤖</div>
            <div>
              <h2 className="text-xl font-medium mb-2">
                Ask your documents anything
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start by typing a question below. I&apos;ll search through
                your indexed documents to find the answer.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => sendMessage(ex)}
                  className="text-sm px-4 py-2 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input (sticky bottom) */}
      <div className="sticky bottom-0 z-10 bg-background/90 backdrop-blur border-t border-white/5">
        <ChatInput />
      </div>
    </div>
  );
}

