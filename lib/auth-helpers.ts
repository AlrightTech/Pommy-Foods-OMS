import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import type { UserRole } from "@prisma/client"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  storeId?: string
}

/**
 * Get the current session user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)
  return session?.user as AuthUser | null
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
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
export async function requireRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
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

