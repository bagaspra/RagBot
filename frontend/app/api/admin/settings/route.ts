import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

/** Proxy GET/POST /api/admin/settings → backend /admin/settings/rag */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/settings/rag`, {
      headers: { "X-Admin-API-Key": ADMIN_API_KEY },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/admin/settings/rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-API-Key": ADMIN_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
