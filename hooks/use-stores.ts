"use client"

import { useApi, useApiMutation } from "./use-api"

type Store = {
  id: string
  name: string
  contactName: string
  email?: string
  phone: string
  address: string
  city: string
  region: string
  latitude?: number
  longitude?: number
  creditLimit?: number
  paymentTerms?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type StoreFilters = {
  search?: string
  region?: string
  city?: string
  isActive?: boolean
}

/**
 * Hook for fetching stores list
 */
export function useStores(filters?: StoreFilters) {
  return useApi<Store[]>("/api/stores", filters as any)
}

/**
 * Hook for fetching a single store
 */
export function useStore(storeId: string) {
  return useApi<Store>(`/api/stores/${storeId}`)
}

/**
 * Hook for creating a store
 */
export function useCreateStore() {
  return useApiMutation<Store, Omit<Store, "id" | "createdAt" | "updatedAt">>("/api/stores", "POST")
}

/**
 * Hook for updating a store
 */
export function useUpdateStore(storeId: string) {
  return useApiMutation<Store, Partial<Store>>(`/api/stores/${storeId}`, "PUT")
}

