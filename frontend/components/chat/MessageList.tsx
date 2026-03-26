"use client";

import React, { useEffect, useRef } from "react";

import type { Message } from "@/types";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

/**
 * Scrollable message list. Automatically scrolls to the latest message.
 */
export default function MessageList(props: { messages: Message[] }) {
  const { messages } = props;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastContent = messages.length > 0 ? messages[messages.length - 1]?.content : "";

  /**
   * Scroll to the bottom when the message list updates.
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, lastContent]);

  /**
   * Render messages in chronological order.
   */
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-4">
      {messages.map((message) => {
        const shouldShowTyping =
          message.role === "assistant" && message.isStreaming === true && message.content.trim().length === 0;

        return (
          <React.Fragment key={message.id}>
            {shouldShowTyping ? (
              <TypingIndicator />
            ) : (
              <MessageBubble message={message} />
            )}
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

