"use client"

import { useApi, useApiMutation } from "./use-api"
import type { DeliveryStatus } from "@/types"

type Delivery = {
  id: string
  orderId: string
  order?: {
    id: string
    orderNumber: string
  }
  store?: {
    id: string
    name: string
  }
  storeId: string
  storeName?: string
  deliveryAddress: string
  scheduledDate: Date | string
  status: DeliveryStatus
  driverId?: string | null
  driver?: {
    id: string
    name: string
  }
  driverName?: string | null
  assignedAt?: Date | string | null
  startedAt?: Date | string | null
  deliveredAt?: Date | string | null
  createdAt: Date | string
}

type DeliveryFilters = {
  status?: DeliveryStatus
  storeId?: string
  driverId?: string
  startDate?: string
  endDate?: string
}

/**
 * Hook for fetching deliveries list
 */
export function useDeliveries(filters?: DeliveryFilters) {
  return useApi<Delivery[]>("/api/deliveries", filters as any)
}

/**
 * Hook for fetching a single delivery
 */
export function useDelivery(deliveryId: string) {
  return useApi<Delivery>(`/api/deliveries/${deliveryId}`)
}

/**
 * Hook for assigning a driver to a delivery
 * Note: deliveryId can be passed as second parameter to mutate function
 */
export function useAssignDriver(deliveryId: string = "") {
  return {
    mutate: async (data: { driverId: string }, endpoint?: string) => {
      const url = endpoint || `/api/deliveries/${deliveryId}/assign`
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Failed to assign driver")
      }
      
      return response.json()
    },
    loading: false,
  }
}

/**
 * Hook for starting a delivery
 */
export function useStartDelivery(deliveryId: string) {
  return useApiMutation<Delivery>(`/api/deliveries/${deliveryId}/start`, "POST")
}

/**
 * Hook for completing a delivery
 */
export function useCompleteDelivery(deliveryId: string) {
  return useApiMutation<Delivery>(`/api/deliveries/${deliveryId}/complete`, "POST")
}
