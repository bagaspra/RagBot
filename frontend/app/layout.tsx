import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG Chatbot",
  description: "Internal Q&A",
};

/**
 * Root application layout.
 * ThemeProvider is NOT here — each route section applies its own:
 *   - /admin  → ThemeProvider (light default, storageKey="rag-admin-theme")
 *   - /(chat) → ChatThemeProvider (dark default, storageKey="rag-chat-theme")
 * suppressHydrationWarning is still required on <html> for next-themes.
 */
export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

