"use client"

import { useApi, useApiMutation } from "./use-api"

type Product = {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  unit?: string
  category?: string
  shelfLife: number
  storageTempMin?: number
  storageTempMax?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type ProductFilters = {
  search?: string
  category?: string
  isActive?: boolean
}

/**
 * Hook for fetching products list
 */
export function useProducts(filters?: ProductFilters) {
  return useApi<Product[]>("/api/products", filters as any)
}

/**
 * Hook for fetching a single product
 */
export function useProduct(productId: string) {
  return useApi<Product>(`/api/products/${productId}`)
}

/**
 * Hook for creating a product
 */
export function useCreateProduct() {
  return useApiMutation<Product, Omit<Product, "id" | "createdAt" | "updatedAt">>("/api/products", "POST")
}

/**
 * Hook for updating a product
 */
export function useUpdateProduct(productId: string) {
  return useApiMutation<Product, Partial<Product>>(`/api/products/${productId}`, "PUT")
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct(productId: string) {
  return useApiMutation<void>(`/api/products/${productId}`, "DELETE")
}

