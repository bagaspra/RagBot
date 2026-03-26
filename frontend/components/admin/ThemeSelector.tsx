"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Monitor, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Card-style 3-way theme selector: Light | System | Dark.
 *  Shows 3 side-by-side cards instead of icon buttons.
 *  Uses mounted check to prevent hydration mismatch. */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light",  icon: Sun,     label: "Light"  },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark",   icon: Moon,    label: "Dark"   },
  ];

  return (
    <div className="flex items-center gap-3">
      {options.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all duration-150 text-sm font-medium",
              active
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
            )}
          >
            <Icon className={cn("size-5", active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
