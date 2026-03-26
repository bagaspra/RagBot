import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge-compatible middleware.
 * Does NOT import next-auth or any auth module.
 * Reads the next-auth session token directly from
 * cookies and decodes it without any Node.js APIs.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith("/admin")

  if (!isAdminRoute) {
    return NextResponse.next()
  }

  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ??
    req.cookies.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
