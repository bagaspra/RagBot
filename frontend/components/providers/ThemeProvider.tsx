"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
/** Wraps next-themes ThemeProvider. attribute="class" makes Tailwind dark: classes work. defaultTheme="light" means admin defaults to light mode. storageKey keeps theme in localStorage. */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem storageKey="rag-admin-theme" {...props}>
      {children}
    </NextThemesProvider>
  );
}
