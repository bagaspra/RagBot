import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

/** Proxy GET /api/admin/chat-logs/stats → backend /admin/chat-logs/stats */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/chat-logs/stats`, {
      headers: { "X-Admin-API-Key": ADMIN_API_KEY },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
