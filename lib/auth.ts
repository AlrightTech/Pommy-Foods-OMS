import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  // Trust proxy for production deployments (Vercel, etc.)
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { store: true },
        })

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials or inactive account")
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.passwordHash
        )

        if (!isValidPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.storeId = user.storeId
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.storeId = token.storeId as string | undefined
      }
      return session
    },
  },
}

// Note: NextAuth v5 beta uses different session handling
// Use middleware.ts for route protection instead
// For API routes, use getToken from next-auth/jwt
export async function getServerSession() {
  // NextAuth v5 beta doesn't export getServerSession
  // Use getToken from next-auth/jwt in middleware instead
  // This is a placeholder that returns null
  return null as any
}
