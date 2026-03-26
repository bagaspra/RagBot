import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        /**
         * Simple hardcoded admin check.
         * In production, replace with database lookup.
         * Credentials loaded from environment variables.
         */
        const adminUser = process.env.ADMIN_USERNAME
        const adminPass = process.env.ADMIN_PASSWORD

        if (
          credentials?.username === adminUser &&
          credentials?.password === adminPass
        ) {
          return {
            id: "1",
            name: "Admin",
            email: process.env.ADMIN_EMAIL ?? "admin@company.com",
            role: "admin",
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      /** Attach role to JWT token on sign in */
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      /** Expose role in session object */
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
})
