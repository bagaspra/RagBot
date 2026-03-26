export interface Message {
  id: string; // nanoid generated
  role: "user" | "assistant";
  content: string;
  sources: string[]; // filenames of source docs
  timestamp: Date;
  isStreaming?: boolean; // true while SSE is active
}

export interface ChatSession {
  id: string;
  title: string; // first user message, truncated
  createdAt: Date;
  messages: Message[];
}

export interface BackendHealthResponse {
  status: "ok" | "error";
  version: string;
}

export interface ChatApiRequest {
  query: string;
}

