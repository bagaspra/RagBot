"use client";
import { useTheme } from "next-themes";
import { Sun, Monitor, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Compact 3-way theme toggle: Light | System | Dark. Sits in AdminTopBar. Uses icon-only buttons with tooltip. Prevents hydration mismatch via mounted check. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light",  icon: Sun,     label: "Light mode" },
    { value: "system", icon: Monitor, label: "System default" },
    { value: "dark",   icon: Moon,    label: "Dark mode" },
  ];

  return (
    <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150",
            theme === value
              ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
