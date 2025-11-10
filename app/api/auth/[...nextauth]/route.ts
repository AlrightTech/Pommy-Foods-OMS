import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// NextAuth v5 beta - create handler and export as GET and POST
// This pattern works for NextAuth v5.0.0-beta.22
const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler

