"use client";

import React from "react";
import { FileText } from "lucide-react";

import * as Accordion from "@radix-ui/react-accordion";

/**
 * Render a collapsible list of document sources.
 */
export default function SourcesAccordion(props: { sources: string[] }) {
  const { sources } = props;
  const itemValue = "sources";

  return (
    <Accordion.Root type="single" collapsible className="w-full" defaultValue={undefined}>
      <Accordion.Item value={itemValue} className="w-full">
        <Accordion.Header>
          <Accordion.Trigger className="flex items-center gap-2 px-3 py-2 mt-3 text-xs text-primary hover:text-primary">
            <span>📄 View Sources ({sources.length})</span>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="overflow-hidden">
          <div className="pb-3 px-3">
            <div className="flex flex-wrap gap-2">
              {sources.map((src) => (
                <div
                  key={src}
                  className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[12px] px-2 py-1 rounded-[6px] max-w-full"
                >
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{src}</span>
                </div>
              ))}
            </div>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

