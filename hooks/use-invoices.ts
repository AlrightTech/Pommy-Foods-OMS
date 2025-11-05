"use client"

import { useApi, useApiMutation } from "./use-api"
import type { InvoiceStatus } from "@/types"

type Invoice = {
  id: string
  invoiceNumber: string
  orderId: string
  order?: {
    id: string
    orderNumber: string
  }
  storeId: string
  store?: {
    id: string
    name: string
  }
  totalAmount: number
  paidAmount?: number
  remainingAmount?: number
  status: InvoiceStatus
  dueDate?: Date | string | null
  issuedAt: Date | string
  paidAt?: Date | string | null
  createdAt: Date | string
}

type InvoiceFilters = {
  storeId?: string
  status?: InvoiceStatus
  startDate?: string
  endDate?: string
  dueDateStart?: string
  dueDateEnd?: string
  search?: string
}

/**
 * Hook for fetching invoices list
 */
export function useInvoices(filters?: InvoiceFilters) {
  return useApi<Invoice[]>("/api/invoices", filters as any)
}

/**
 * Hook for fetching a single invoice
 */
export function useInvoice(invoiceId: string) {
  return useApi<Invoice>(`/api/invoices/${invoiceId}`)
}

/**
 * Hook for generating an invoice from an order
 */
export function useGenerateInvoice() {
  return useApiMutation<Invoice, {
    orderId: string
    discount?: number
    tax?: number
    dueDate?: string
  }>("/api/invoices", "POST")
}

