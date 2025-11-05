"use client"

import { useApiMutation } from "./use-api"
import type { PaymentMethod } from "@/types"

/**
 * Hook for logging temperature (driver action)
 */
export function useLogTemperature() {
  return useApiMutation<any, {
    deliveryId: string
    temperature: number
    location: string
    notes?: string
  }>("/api/driver/temperature", "POST")
}

/**
 * Hook for submitting returns (driver action)
 */
export function useSubmitReturn() {
  return useApiMutation<any, {
    deliveryId: string
    items: Array<{
      productId: string
      quantity: number
      expiryDate: string
      reason?: string
    }>
    notes?: string
  }>("/api/driver/returns", "POST")
}

/**
 * Hook for recording payment (driver action)
 */
export function useRecordPayment() {
  return useApiMutation<any, {
    invoiceId: string
    deliveryId?: string
    amount: number
    receiptUrl?: string
    notes?: string
  }>("/api/driver/payments", "POST")
}

