import React from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Card wrapper for a group of settings rows with a section title. */
export default function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden mb-6",
      className
    )}>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {children}
      </div>
    </div>
  );
}
