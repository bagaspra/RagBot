import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Minimal Edge-compatible middleware with no Clerk imports.
 *
 * WHY: Clerk v5 uses Node.js-only internals (#crypto, devBrowser) that
 * are incompatible with Vercel's Edge Runtime. Next.js 14 middleware
 * ALWAYS runs on Edge — there is no way to switch it to Node.js.
 *
 * Auth protection is handled server-side in app/admin/layout.tsx via
 * Clerk's auth() + currentUser() which run on Node.js (not Edge), so
 * unauthenticated users are still redirected to /sign-in before any
 * admin content is rendered.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
