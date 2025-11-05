"use client"

import { useApi, useApiMutation } from "./use-api"

type Return = {
  id: string
  deliveryId: string
  delivery?: {
    id: string
    order?: {
      id: string
      orderNumber: string
    }
    store?: {
      id: string
      name: string
    }
  }
  status: "PENDING" | "PROCESSED" | "REJECTED"
  createdAt: Date | string
  items: Array<{
    id: string
    productId: string
    product?: {
      id: string
      name: string
    }
    quantity: number
    expiryDate?: Date | string | null
    reason: string
  }>
}

type ReturnFilters = {
  storeId?: string
  deliveryId?: string
  status?: "PENDING" | "PROCESSED" | "REJECTED"
  startDate?: string
  endDate?: string
}

/**
 * Hook for fetching returns list
 */
export function useReturns(filters?: ReturnFilters) {
  return useApi<Return[]>("/api/returns", filters as any)
}

/**
 * Hook for fetching a single return
 */
export function useReturn(returnId: string) {
  return useApi<Return>(`/api/returns/${returnId}`)
}

/**
 * Hook for creating a return
 */
export function useCreateReturn() {
  return useApiMutation<Return, {
    deliveryId: string
    items: Array<{
      productId: string
      quantity: number
      expiryDate: string
      reason?: string
    }>
    notes?: string
  }>("/api/returns", "POST")
}

/**
 * Hook for processing a return
 */
export function useProcessReturn(returnId: string) {
  return useApiMutation<Return>(`/api/returns/${returnId}/process`, "POST")
}

