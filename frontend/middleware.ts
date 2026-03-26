import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isSignInPage = req.nextUrl.pathname === "/sign-in"
  const isAuthenticated = !!req.auth
  const isAdmin = (req.auth?.user as { role?: string })?.role === "admin"

  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl))
  }

  if (isAdminRoute && isAuthenticated && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
