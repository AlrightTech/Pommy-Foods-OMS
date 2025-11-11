import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { validateAuthConfig } from "@/lib/auth-config"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Validate configuration before initializing NextAuth
const validation = validateAuthConfig()
if (!validation.isValid) {
  console.error("NextAuth Configuration Errors:")
  validation.errors.forEach((error) => console.error(`  - ${error}`))
}

// NextAuth v5 beta - get handlers from NextAuth
// Wrap in try-catch to handle initialization errors gracefully
let handlers: { GET: any; POST: any }

try {
  const nextAuth = NextAuth(authOptions)
  handlers = nextAuth.handlers
} catch (error) {
  console.error("Failed to initialize NextAuth:", error)
  // Create error handlers that provide helpful error messages
  const errorResponse = (message: string) => {
    return NextResponse.json(
      { 
        error: "Configuration", 
        message,
        details: validation.errors.length > 0 
          ? validation.errors.join(" ") 
          : "NextAuth is not properly configured. Check server logs for details."
      },
      { status: 500 }
    )
  }
  
  handlers = {
    GET: async () => errorResponse("NextAuth is not properly configured. Check server logs for details."),
    POST: async () => errorResponse("NextAuth is not properly configured. Check server logs for details."),
  }
}

// Export GET and POST handlers with error handling
export const GET = async (req: Request, context: any) => {
  try {
    // Check configuration before processing request
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Configuration",
          message: "Authentication is not properly configured",
          details: validation.errors.join(" "),
          help: "Please check your environment variables: NEXTAUTH_SECRET and NEXTAUTH_URL",
        },
        { status: 500 }
      )
    }
    return await handlers.GET(req, context)
  } catch (error: any) {
    console.error("NextAuth GET error:", error)
    // Check if it's a configuration error
    if (error?.message?.includes("secret") || error?.message?.includes("NEXTAUTH")) {
      return NextResponse.json(
        {
          error: "Configuration",
          message: "Authentication configuration error",
          details: error?.message || "Please check your NEXTAUTH_SECRET and NEXTAUTH_URL environment variables",
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      {
        error: "Configuration",
        message: error?.message || "Authentication error",
      },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request, context: any) => {
  try {
    // Check configuration before processing request
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Configuration",
          message: "Authentication is not properly configured",
          details: validation.errors.join(" "),
          help: "Please check your environment variables: NEXTAUTH_SECRET and NEXTAUTH_URL",
        },
        { status: 500 }
      )
    }
    return await handlers.POST(req, context)
  } catch (error: any) {
    console.error("NextAuth POST error:", error)
    // Check if it's a configuration error
    if (error?.message?.includes("secret") || error?.message?.includes("NEXTAUTH")) {
      return NextResponse.json(
        {
          error: "Configuration",
          message: "Authentication configuration error",
          details: error?.message || "Please check your NEXTAUTH_SECRET and NEXTAUTH_URL environment variables",
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      {
        error: "Configuration",
        message: error?.message || "Authentication error",
      },
      { status: 500 }
    )
  }
}

