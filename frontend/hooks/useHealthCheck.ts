"use client";

import { useEffect } from "react";

import { useChatStore } from "@/store/chatStore";

type BackendHealthResponse = {
  status: "ok" | "error";
  version: string;
};

/**
 * Health checker hook. Probes the backend on mount and updates Zustand.
 */
export function useHealthCheck(): { backendStatus: "online" | "offline" | "checking" } {
  const backendStatus = useChatStore((s) => s.backendStatus);
  const setBackendStatus = useChatStore((s) => s.setBackendStatus);

  useEffect(() => {
    let cancelled = false;

    /**
     * Attempt to fetch health from the backend proxy.
     */
    const check = async (attempt: number): Promise<void> => {
      try {
        setBackendStatus("checking");
        const res = await fetch("/api/health", { method: "GET" });
        const data = (await res.json()) as BackendHealthResponse;

        if (!res.ok || data.status !== "ok") {
          throw new Error("Backend health check failed.");
        }

        if (!cancelled) setBackendStatus("online");
      } catch {
        if (cancelled) return;
        if (attempt === 0) {
          setTimeout(() => {
            void check(1);
          }, 3000);
          return;
        }
        setBackendStatus("offline");
      }
    };

    void check(0);
    return () => {
      cancelled = true;
    };
  }, [setBackendStatus]);

  return { backendStatus };
}

