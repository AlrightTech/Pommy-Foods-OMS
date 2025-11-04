import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import type { UserRole } from "@prisma/client"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  storeId?: string
}

/**
 * Get the current authenticated user from request
 * Use this in API routes
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return null
  }

  return {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string,
    role: token.role as UserRole,
    storeId: token.storeId as string | undefined,
  }
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(request?: NextRequest): Promise<AuthUser> {
  if (!request) {
    throw new Error("Request object required for authentication")
  }

  const user = await getCurrentUser(request)
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, roles: UserRole[]): boolean {
  return roles.includes(user.role)
}

/**
 * Require role - throws if user doesn't have required role
 */
export async function requireRole(roles: UserRole[], request?: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (!hasRole(user, roles)) {
    throw new Error("Forbidden")
  }
  return user
}

/**
 * Check if user can access store resource
 */
export function canAccessStore(user: AuthUser, storeId: string): boolean {
  // Admins can access all stores
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return true
  }

  // Store owners/managers can only access their own store
  return user.storeId === storeId
}
