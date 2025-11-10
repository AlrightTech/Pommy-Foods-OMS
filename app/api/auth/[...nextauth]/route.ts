import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

// NextAuth v5 beta type workaround
// The handler is a NextAuthResult which implements GET and POST but TypeScript doesn't recognize it
// @ts-expect-error - NextAuth v5 beta has incomplete types
export const { GET, POST } = handler

