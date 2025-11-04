"use client"

import { useApi, useApiMutation } from "./use-api"

type UserData = {
  id: string
  name: string
  email: string
  role: string
  storeId?: string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  store?: {
    id: string
    name: string
  } | null
}

/**
 * Hook for fetching current user data
 */
export function useCurrentUser() {
  return useApi<UserData>("/api/users/me")
}

/**
 * Hook for updating user profile
 */
export function useUpdateUser() {
  return useApiMutation<UserData, {
    name?: string
    email?: string
  }>("/api/users/me", "PUT")
}

/**
 * Hook for updating user password
 */
export function useUpdatePassword() {
  return useApiMutation<{ success: boolean; message: string }, {
    currentPassword: string
    newPassword: string
  }>("/api/users/me/password", "PUT")
}

