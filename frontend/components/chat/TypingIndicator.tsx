"use client";

import React from "react";
import { Bot } from "lucide-react";

/**
 * Typing indicator shown while SSE is streaming the first tokens.
 */
export default function TypingIndicator() {
  return (
    <div className="flex flex-col items-start gap-3 max-w-[85%]">
      <div className="flex flex-row items-end gap-3">
        <div className="min-w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div className="bg-muted text-foreground px-6 py-5 rounded-2xl rounded-bl-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1 h-1 bg-primary rounded-full animate-pulse" />
            <span className="text-sm">
              <span className="inline-block opacity-70">Answering</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full bg-primary animate-[opacityPulse_1s_ease-in-out_infinite]"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-primary animate-[opacityPulse_1s_ease-in-out_infinite]"
                style={{ animationDelay: "200ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-primary animate-[opacityPulse_1s_ease-in-out_infinite]"
                style={{ animationDelay: "400ms" }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

