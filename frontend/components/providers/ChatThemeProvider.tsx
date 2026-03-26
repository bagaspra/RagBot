"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * Theme provider for the chat section.
 * Uses a separate localStorage key so chat and admin themes are independent.
 * defaultTheme="dark" preserves the original dark look for chat.
 */
export function ChatThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="rag-chat-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
