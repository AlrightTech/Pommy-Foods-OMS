"use client"

import { useApi, useApiMutation } from "./use-api"
import type { OrderStatus, OrderType } from "@/types"
import type { Order } from "@prisma/client"

type OrderFilters = {
  storeId?: string
  status?: OrderStatus
  orderType?: OrderType
  startDate?: string
  endDate?: string
  search?: string
}

/**
 * Hook for fetching orders list
 */
export function useOrders(filters?: OrderFilters) {
  return useApi<Order[]>("/api/orders", filters as any)
}

/**
 * Hook for fetching a single order
 */
export function useOrder(orderId: string) {
  return useApi<Order>(`/api/orders/${orderId}`)
}

/**
 * Hook for creating an order
 */
export function useCreateOrder() {
  return useApiMutation<Order, {
    storeId: string
    orderType: OrderType
    items: Array<{ productId: string; quantity: number }>
    notes?: string
  }>("/api/orders", "POST")
}

/**
 * Hook for updating an order
 */
export function useUpdateOrder(orderId: string) {
  return useApiMutation<Order, Partial<Order>>(`/api/orders/${orderId}`, "PUT")
}

/**
 * Hook for approving an order
 */
export function useApproveOrder(orderId: string) {
  return useApiMutation<Order>(`/api/orders/${orderId}/approve`, "POST")
}

/**
 * Hook for rejecting an order
 */
export function useRejectOrder(orderId: string) {
  return useApiMutation<Order, { reason?: string }>(`/api/orders/${orderId}/reject`, "POST")
}

