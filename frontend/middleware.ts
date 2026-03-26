import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

/**
 * Middleware uses the edge-safe authConfig only (no Credentials provider).
 * Route protection logic lives in authConfig.callbacks.authorized.
 * Node.js-only code (Credentials provider) stays in auth.ts.
 */
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
