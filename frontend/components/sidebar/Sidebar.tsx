"use client";

import React, { useEffect, useState } from "react";
import { Layers, Menu, Trash2 } from "lucide-react";

import { useChatStore } from "@/store/chatStore";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

import ChatHistory from "./ChatHistory";
import DocumentStatus from "./DocumentStatus";

/**
 * Left sidebar with chat history and document indexing status.
 */
export default function Sidebar() {
  const createSession = useChatStore((s) => s.createSession);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  /**
   * Close the mobile drawer.
   */
  const closeMobile = (): void => setMobileOpen(false);

  /**
   * Open the mobile drawer.
   */
  const openMobile = (): void => setMobileOpen(true);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  /**
   * Start a new chat session.
   */
  const handleNewChat = (): void => {
    createSession();
    closeMobile();
  };

  const sidebarContent = (
    <div className="w-[260px] flex-shrink-0 bg-background text-foreground h-full font-headline">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="text-primary w-6 h-6" />
          <div className="flex flex-col leading-tight">
            <div className="text-xl font-bold tracking-tighter text-foreground">RAG Assistant</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              The Cognitive Architect
            </div>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-primary/70 font-medium">Powered by LLaMA 3</div>

        <div className="mt-5 px-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 border border-primary-container/40 text-primary px-3 py-3 rounded-lg font-semibold hover:bg-primary-container/10 transition-all active:scale-[0.98]"
          >
            New Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <ChatHistory />
      </div>

      <div className="p-4 space-y-4">
        <DocumentStatus />

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Theme</span>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center text-xs font-bold text-foreground uppercase overflow-hidden">
            U
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">User</p>
            <p className="text-[10px] text-muted-foreground truncate">Enterprise User</p>
          </div>
          <Trash2 className="w-4 h-4 opacity-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-primary-container/10 text-primary border border-primary-container/20"
        onClick={openMobile}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar (layout also hides/shows via grid). */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobile}
            aria-label="Close sidebar"
          />
          <div className="absolute left-0 top-0 bottom-0">{sidebarContent}</div>
        </div>
      ) : null}
    </>
  );
}

