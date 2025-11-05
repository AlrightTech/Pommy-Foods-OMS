"use client"

import { useApi, useApiMutation } from "./use-api"

type KitchenSheet = {
  id: string
  orderId: string
  order?: {
    id: string
    orderNumber: string
    store?: {
      id: string
      name: string
      address?: string
      city?: string
    }
  }
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  createdAt: Date | string
  completedAt?: Date | string | null
  preparedBy?: string | null
  items: Array<{
    id: string
    productId: string
    product?: {
      id: string
      name: string
      sku: string
      shelfLife?: number
      storageTempMin?: number
      storageTempMax?: number
    }
    quantity: number
    batchNumber?: string | null
    expiryDate?: Date | string | null
    isPacked: boolean
    barcode?: string | null
    qrCode?: string | null
  }>
}

type KitchenSheetFilters = {
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  orderId?: string
  preparedBy?: string
}

/**
 * Hook for fetching kitchen sheets list
 */
export function useKitchenSheets(filters?: KitchenSheetFilters) {
  return useApi<KitchenSheet[]>("/api/kitchen-sheets", filters as any)
}

/**
 * Hook for fetching a single kitchen sheet
 */
export function useKitchenSheet(sheetId: string) {
  return useApi<KitchenSheet>(`/api/kitchen-sheets/${sheetId}`)
}

/**
 * Hook for creating/generating a kitchen sheet from an order
 */
export function useGenerateKitchenSheet() {
  return useApiMutation<KitchenSheet, { orderId: string }>("/api/kitchen-sheets", "POST")
}

/**
 * Hook for updating a kitchen sheet item
 */
export function useUpdateKitchenItem(sheetId: string) {
  return {
    mutate: async (itemId: string, data: { batchNumber?: string; expiryDate?: string; isPacked?: boolean }) => {
      const response = await fetch(`/api/kitchen-sheets/${sheetId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Failed to update item")
      }
      
      return response.json()
    },
    loading: false,
  }
}

/**
 * Hook for marking an item as packed
 */
export function usePackKitchenItem(sheetId: string) {
  return {
    mutate: async (itemId: string, data: { batchNumber: string; expiryDate: string }) => {
      const response = await fetch(`/api/kitchen-sheets/${sheetId}/items/${itemId}/pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Failed to pack item")
      }
      
      return response.json()
    },
    loading: false,
  }
}

/**
 * Hook for completing a kitchen sheet
 */
export function useCompleteKitchenSheet(sheetId: string) {
  return useApiMutation<KitchenSheet>(`/api/kitchen-sheets/${sheetId}/complete`, "POST")
}
