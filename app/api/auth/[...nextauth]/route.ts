import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// NextAuth v5 beta - get handlers from NextAuth
const { handlers } = NextAuth(authOptions)

// Export GET and POST handlers
export const { GET, POST } = handlers

