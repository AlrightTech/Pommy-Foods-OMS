import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/api/auth"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Skip middleware for static files and API routes (they handle their own auth)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  // Only check token if NEXTAUTH_SECRET is configured
  let token = null
  if (process.env.NEXTAUTH_SECRET) {
    try {
      token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      })
    } catch (error) {
      // If token validation fails due to config issues, log but don't block
      // The auth route handler will return proper error messages
      console.error("Token validation error:", error)
    }
  }

  // Dashboard routes require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Store routes require authentication
  if (pathname.startsWith("/store")) {
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Driver routes require authentication
  if (pathname.startsWith("/driver")) {
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Root path - allow access (landing page handles redirect)
  if (pathname === "/") {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - but we handle /api/auth specially
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
