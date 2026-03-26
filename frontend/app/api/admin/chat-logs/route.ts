import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

/** Proxy GET /api/admin/chat-logs → backend /admin/chat-logs */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const url = `${BACKEND_URL}/admin/chat-logs${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: { "X-Admin-API-Key": ADMIN_API_KEY },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
