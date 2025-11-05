"use client"

import { useApi, useApiMutation } from "./use-api"

type StockItem = {
  id: string
  storeId: string
  store?: {
    id: string
    name: string
  }
  productId: string
  product?: {
    id: string
    name: string
    sku: string
  }
  currentLevel: number
  threshold: number
  isLowStock: boolean
  lastUpdated: Date | string
}

type StockFilters = {
  storeId?: string
  productId?: string
  lowStock?: boolean
  search?: string
}

/**
 * Hook for fetching stock levels
 */
export function useStock(filters?: StockFilters) {
  return useApi<StockItem[]>("/api/stock", filters as any)
}

/**
 * Hook for updating stock level
 */
export function useUpdateStock() {
  return useApiMutation<StockItem, {
    storeId: string
    productId: string
    currentLevel: number
    threshold?: number
  }>("/api/stock", "POST")
}

