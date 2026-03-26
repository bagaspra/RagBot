import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
})
