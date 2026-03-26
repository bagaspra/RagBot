"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatSession, Message } from "@/types";

type BackendStatus = "online" | "offline" | "checking";

type ChatStore = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isStreaming: boolean;
  backendStatus: BackendStatus;

  createSession: () => ChatSession;
  setActiveSessionId: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  appendToken: (sessionId: string, messageId: string, token: string) => void;
  finalizeMessage: (sessionId: string, messageId: string, sources: string[]) => void;
  clearSession: (sessionId: string) => void;
  setBackendStatus: (status: BackendStatus) => void;
};

/**
 * Zustand chat store with persisted sessions.
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,
      backendStatus: "checking",

      createSession: () => {
        const now = new Date();
        const session: ChatSession = {
          id: nanoid(),
          title: "New Chat",
          createdAt: now,
          messages: [],
        };
        set({ sessions: [session, ...get().sessions], activeSessionId: session.id });
        return session;
      },

      setActiveSessionId: (sessionId: string) => {
        set({ activeSessionId: sessionId, isStreaming: false });
      },

      addMessage: (sessionId: string, message: Message) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id !== sessionId) return s;

            const isFirstUserMessage = s.messages.length === 0 && message.role === "user";
            const nextTitle = isFirstUserMessage
              ? message.content.trim().slice(0, 40) || "New Chat"
              : s.title;

            const nextMessages = [...s.messages, message];
            return { ...s, title: nextTitle, messages: nextMessages };
          });

          // Streaming is derived from whether we added a streaming assistant message.
          const nextIsStreaming = message.role === "assistant" && message.isStreaming === true;
          return { sessions, isStreaming: nextIsStreaming };
        });
      },

      appendToken: (sessionId: string, messageId: string, token: string) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id !== messageId) return m;
                return {
                  ...m,
                  content: (m.content || "") + token,
                  isStreaming: true,
                };
              }),
            };
          });
          return { sessions, isStreaming: true };
        });
      },

      finalizeMessage: (sessionId: string, messageId: string, sources: string[]) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id !== messageId) return m;
                return {
                  ...m,
                  sources,
                  isStreaming: false,
                };
              }),
            };
          });
          return { sessions, isStreaming: false };
        });
      },

      clearSession: (sessionId: string) => {
        set((state) => {
          const nextSessions = state.sessions.filter((s) => s.id !== sessionId);
          const nextActive =
            state.activeSessionId === sessionId ? (nextSessions[0]?.id ?? null) : state.activeSessionId;
          return { sessions: nextSessions, activeSessionId: nextActive, isStreaming: false };
        });
      },

      setBackendStatus: (status: BackendStatus) => {
        set({ backendStatus: status });
      },
    }),
    {
      name: "rag-chatbot-store",
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
);

