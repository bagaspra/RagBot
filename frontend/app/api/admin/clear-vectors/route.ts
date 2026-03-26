import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

/** Proxy POST /api/admin/clear-vectors → backend /admin/settings/clear-vectors */
export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/settings/clear-vectors`, {
      method: "POST",
      headers: { "X-Admin-API-Key": ADMIN_API_KEY },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
