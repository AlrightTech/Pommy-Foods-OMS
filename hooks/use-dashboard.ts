"use client"

import { useMemo } from "react"
import { useOrders } from "./use-orders"
import { useProducts } from "./use-products"
import { useStores } from "./use-stores"
import { useSalesAnalytics } from "./use-analytics"
import { formatDistanceToNow } from "date-fns"

type DashboardStats = {
  pendingOrders: number
  todayRevenue: number
  todayRevenueChange?: string
  activeProducts: number
  activeProductsChange?: string
  activeStores: number
  activeStoresChange?: string
}

type RecentOrder = {
  id: string
  orderNumber: string
  store: string
  amount: string
  status: string
  time: string
}

/**
 * Hook for dashboard statistics
 */
export function useDashboardStats() {
  // Fetch all orders to calculate stats
  const { data: orders, loading: ordersLoading } = useOrders()
  
  // Fetch all orders for today's revenue calculation
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  
  const { data: todayOrders } = useOrders({
    startDate: today.toISOString(),
    endDate: todayEnd.toISOString(),
  })

  // Fetch active products
  const { data: products, loading: productsLoading } = useProducts({ isActive: true })

  // Fetch active stores
  const { data: stores, loading: storesLoading } = useStores({ isActive: true })

  // Fetch sales analytics for revenue calculation (today)
  const { data: salesData } = useSalesAnalytics({
    startDate: today.toISOString(),
    endDate: new Date().toISOString(),
  })

  // Fetch previous period data for comparison (yesterday for revenue)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(23, 59, 59, 999)

  const { data: yesterdayOrders } = useOrders({
    startDate: yesterday.toISOString(),
    endDate: yesterdayEnd.toISOString(),
  })

  const { data: yesterdaySalesData } = useSalesAnalytics({
    startDate: yesterday.toISOString(),
    endDate: yesterdayEnd.toISOString(),
  })

  // Fetch previous period products/stores (for comparison)
  const { data: previousProducts } = useProducts({ isActive: true })
  const { data: previousStores } = useStores({ isActive: true })

  const stats = useMemo<DashboardStats>(() => {
    const pendingOrdersCount = orders?.filter(
      (order) => order.status === "PENDING" || order.status === "DRAFT"
    ).length || 0

    // Calculate today's revenue from orders or sales data
    let todayRevenue = 0
    if (salesData?.totalRevenue) {
      todayRevenue = Number(salesData.totalRevenue)
    } else if (todayOrders) {
      todayRevenue = todayOrders.reduce((sum, order) => {
        return sum + Number(order.totalAmount || 0)
      }, 0)
    }

    // Calculate yesterday's revenue for comparison
    let yesterdayRevenue = 0
    if (yesterdaySalesData?.totalRevenue) {
      yesterdayRevenue = Number(yesterdaySalesData.totalRevenue)
    } else if (yesterdayOrders) {
      yesterdayRevenue = yesterdayOrders.reduce((sum, order) => {
        return sum + Number(order.totalAmount || 0)
      }, 0)
    }

    // Calculate revenue change percentage
    let todayRevenueChange: string | undefined
    if (yesterdayRevenue > 0) {
      const change = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      todayRevenueChange = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
    } else if (todayRevenue > 0) {
      todayRevenueChange = "+100%"
    }

    const activeProductsCount = products?.length || 0
    const activeStoresCount = stores?.length || 0

    // Note: Products and stores changes would require historical data tracking
    // For now, we'll leave them as null since they don't change frequently

    return {
      pendingOrders: pendingOrdersCount,
      todayRevenue,
      todayRevenueChange,
      activeProducts: activeProductsCount,
      activeStores: activeStoresCount,
    }
  }, [orders, todayOrders, products, stores, salesData, yesterdayOrders, yesterdaySalesData])

  return {
    stats,
    loading: ordersLoading || productsLoading || storesLoading,
  }
}

/**
 * Hook for recent orders
 */
export function useRecentOrders(limit: number = 5) {
  const { data: orders, loading } = useOrders()

  const recentOrders = useMemo<RecentOrder[]>(() => {
    if (!orders) return []

    return orders
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0)
        const dateB = new Date(b.createdAt || b.updatedAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, limit)
      .map((order) => {
        const orderDate = new Date(order.createdAt || order.updatedAt || Date.now())
        const timeAgo = formatDistanceToNow(orderDate, { addSuffix: true })

        return {
          id: order.id,
          orderNumber: order.orderNumber || order.id,
          store: (order as any).store?.name || "Unknown Store",
          amount: `$${Number(order.totalAmount || 0).toFixed(2)}`,
          status: order.status,
          time: timeAgo,
        }
      })
  }, [orders, limit])

  return {
    recentOrders,
    loading,
  }
}

