import { NextResponse } from "next/server";

type ChatApiRequest = {
  query: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Resolve backend URL from server-side environment variables.
 */
function getBackendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("Missing BACKEND_URL environment variable.");
  }
  return url;
}

/**
 * Proxy SSE chat stream from FastAPI to the browser.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const backendUrl = getBackendUrl();
  let payload: ChatApiRequest;

  try {
    payload = (await req.json()) as ChatApiRequest;
  } catch (exc) {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${backendUrl}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: payload.query }),
  });

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "upstream_error",
        message: `Backend returned ${upstream.status}.`,
      },
      { status: 502 },
    );
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: "upstream_error", message: "Backend did not return a response body." },
      { status: 502 },
    );
  }

  // Pipe the SSE stream through unchanged.
  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream; charset=utf-8");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no");

  return new NextResponse(upstream.body, { status: 200, headers });
}

/**
 * Proxy backend health endpoint.
 */
export async function GET(): Promise<NextResponse> {
  const backendUrl = getBackendUrl();
  const upstream = await fetch(`${backendUrl}/health`, { method: "GET" });

  if (!upstream.ok) {
    return NextResponse.json({ status: "error", version: "0.0.0" }, { status: 502 });
  }

  const data = (await upstream.json()) as unknown;
  return NextResponse.json(data, { status: upstream.status });
}

