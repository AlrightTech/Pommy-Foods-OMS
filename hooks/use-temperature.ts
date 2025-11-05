"use client"

import { useApi, useApiMutation } from "./use-api"

type TemperatureLog = {
  id: string
  deliveryId?: string | null
  delivery?: {
    id: string
    store?: {
      id: string
      name: string
    }
  }
  storeId: string
  store?: {
    id: string
    name: string
  }
  temperature: number
  location: string
  isCompliant: boolean
  isManual: boolean
  recordedBy?: string | null
  recordedByUser?: {
    id: string
    name: string
  }
  sensorId?: string | null
  notes?: string | null
  recordedAt: Date | string
  createdAt: Date | string
}

type TemperatureFilters = {
  deliveryId?: string
  storeId?: string
  location?: string
  startDate?: string
  endDate?: string
  compliant?: boolean
}

/**
 * Hook for fetching temperature logs
 */
export function useTemperatureLogs(filters?: TemperatureFilters) {
  return useApi<TemperatureLog[]>("/api/temperature", filters as any)
}

/**
 * Hook for creating a temperature log
 */
export function useCreateTemperatureLog() {
  return useApiMutation<TemperatureLog, {
    deliveryId?: string
    storeId: string
    temperature: number
    location: string
    isManual?: boolean
    sensorId?: string
    notes?: string
  }>("/api/temperature", "POST")
}

