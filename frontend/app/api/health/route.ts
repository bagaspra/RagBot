import { NextResponse } from "next/server";

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
 * Proxy backend health endpoint to the frontend.
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

