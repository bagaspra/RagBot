import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible auth config — no Node.js-only imports allowed here.
 * Used by middleware.ts which runs in Vercel Edge Runtime.
 * The full auth config (with Credentials provider) lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")

      if (isAdminRoute) {
        if (!isLoggedIn) return false // redirects to pages.signIn
        const role = (auth?.user as { role?: string })?.role
        if (role !== "admin") return Response.redirect(new URL("/", nextUrl))
        return true
      }

      return true
    },
  },
  providers: [], // providers are added in auth.ts only
}
