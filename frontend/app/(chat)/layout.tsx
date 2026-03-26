import React from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { ChatThemeProvider } from "@/components/providers/ChatThemeProvider";

/**
 * Layout for the chat portion of the app.
 * Wraps with ChatThemeProvider (dark default, independent localStorage key)
 * so the chat theme does not affect the admin theme.
 */
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatThemeProvider>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr] bg-background text-foreground">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="md:col-start-2 overflow-y-auto">
          <div className="md:hidden">
            <Sidebar />
          </div>
          {children}
        </div>
      </div>
    </ChatThemeProvider>
  );
}
