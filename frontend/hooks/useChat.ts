"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";

import { useChatStore } from "@/store/chatStore";

type ChatApiRequest = {
  query: string;
};

type UseChatReturn = {
  sendMessage: (query: string) => Promise<void>;
  isStreaming: boolean;
};

/**
 * Core chat hook that handles SSE streaming and Zustand message updates.
 */
export function useChat(): UseChatReturn {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const createSession = useChatStore((s) => s.createSession);
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToken = useChatStore((s) => s.appendToken);
  const finalizeMessage = useChatStore((s) => s.finalizeMessage);

  /**
   * Send a query to the backend and stream the assistant response via SSE.
   */
  const sendMessage = useCallback(
    async (query: string): Promise<void> => {
      const trimmed = query.trim();
      if (!trimmed) return;

      // 1) Ensure a session exists.
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = createSession();
        sessionId = session.id;
      }

      if (!sessionId) return;

      // 2) Add user message immediately.
      const userMessageId = nanoid();
      addMessage(sessionId, {
        id: userMessageId,
        role: "user",
        content: trimmed,
        sources: [],
        timestamp: new Date(),
      });

      // 3) Add an empty assistant message that will receive streamed tokens.
      const assistantMessageId = nanoid();
      addMessage(sessionId, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        sources: [],
        timestamp: new Date(),
        isStreaming: true,
      });

      const body: ChatApiRequest = { query: trimmed };

      // Streaming variables.
      let sources: string[] = [];

      try {
        // 4) Call backend via Next.js API proxy.
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}.`);
        }

        if (!response.body) {
          throw new Error("No response body returned for SSE.");
        }

        // 5) Read response as stream.
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // 6) Parse SSE `data:` lines.
        while (true) {
          const readResult = await reader.read();
          if (readResult.done) break;

          buffer += decoder.decode(readResult.value, { stream: true });

          // Events are separated by a blank line (`\n\n`).
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const lines = part.split("\n").filter((line) => line.startsWith("data:"));
            for (const line of lines) {
              // Preserve token spacing.
              // Backend always sends `data: ${token}` (note the space after `data:`),
              // so we strip only ONE leading space used for formatting and keep
              // the token content intact (including real leading/trailing spaces).
              const rawData = line.slice("data:".length);
              const data = rawData.startsWith(" ") ? rawData.slice(1) : rawData;
              const control = data.trim();

              if (control === "[DONE]") {
                finalizeMessage(sessionId, assistantMessageId, sources);
                return;
              }

              if (control.startsWith("[SOURCES]:")) {
                const raw = data.slice("[SOURCES]:".length).trim();
                try {
                  const parsed = JSON.parse(raw) as unknown;
                  sources = Array.isArray(parsed) ? (parsed as string[]) : [];
                } catch {
                  sources = [];
                }
                // Rag layer emits sources at the end; finalize is safe here.
                finalizeMessage(sessionId, assistantMessageId, sources);
                continue;
              }

              // Regular token event.
              appendToken(sessionId, assistantMessageId, data);
            }
          }
        }

        // If the stream ends without [DONE], finalize defensively.
        finalizeMessage(sessionId, assistantMessageId, sources);
      } catch (exc) {
        const errorText = "Sorry, I couldn't reach the backend. Please try again.";
        appendToken(sessionId, assistantMessageId, errorText);
        finalizeMessage(sessionId, assistantMessageId, []);
        window.alert("Chat request failed. Check backend availability.");
      }
    },
    [activeSessionId, addMessage, appendToken, createSession, finalizeMessage],
  );

  return { sendMessage, isStreaming };
}

