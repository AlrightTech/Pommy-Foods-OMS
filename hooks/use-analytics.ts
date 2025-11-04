"use client"

import { useApi } from "./use-api"

type SalesDataPoint = {
  date: string
  sales: number
  orders: number
  revenue: number
}

type SalesReport = {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  byProduct: Array<{
    product: {
      id: string
      name: string
      sku: string
      category?: string | null
      price: string | number
    }
    quantity: number
    revenue: number
    orders: number
  }>
  byStore: Array<{
    store: {
      id: string
      name: string
      region: string
      city: string
    }
    revenue: number
    orders: number
  }>
  timeSeries: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

type ProductPerformance = {
  productId: string
  productName: string
  sales: number
  quantity: number
  revenue: number
}

type StorePerformance = {
  storeId: string
  storeName: string
  sales: number
  orders: number
  revenue: number
}

type DeliveryMetrics = {
  onTimeRate: number
  averageDeliveryTime: number
  totalDeliveries: number
  completedDeliveries: number
}

type StockInsights = {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  lowStockItems: Array<{
    productId: string
    productName: string
    currentLevel: number
    threshold: number
  }>
}

type AnalyticsFilters = {
  storeId?: string
  productId?: string
  startDate?: string
  endDate?: string
  groupBy?: "day" | "week" | "month" | "year"
}

/**
 * Hook for fetching sales analytics
 */
export function useSalesAnalytics(filters?: AnalyticsFilters) {
  return useApi<SalesReport>("/api/analytics/sales", filters as any)
}

/**
 * Hook for fetching product performance analytics
 */
export function useProductAnalytics(filters?: AnalyticsFilters) {
  return useApi<ProductPerformance[]>("/api/analytics/products", filters as any)
}

/**
 * Hook for fetching store performance analytics
 */
export function useStoreAnalytics(filters?: AnalyticsFilters) {
  return useApi<StorePerformance[]>("/api/analytics/stores", filters as any)
}

/**
 * Hook for fetching delivery metrics
 */
export function useDeliveryMetrics(filters?: AnalyticsFilters) {
  return useApi<DeliveryMetrics>("/api/analytics/deliveries", filters as any)
}

/**
 * Hook for fetching stock insights
 */
export function useStockInsights(filters?: { storeId?: string; productId?: string; lowStockOnly?: boolean }) {
  return useApi<StockInsights>("/api/analytics/stock", filters as any)
}

