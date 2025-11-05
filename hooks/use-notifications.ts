"use client"

import { useApi, useApiMutation } from "./use-api"

type NotificationType =
  | "ORDER_APPROVED"
  | "ORDER_REJECTED"
  | "DELIVERY_ASSIGNED"
  | "PAYMENT_RECEIVED"
  | "INVOICE_GENERATED"
  | "STOCK_LOW"
  | "TEMPERATURE_ALERT"

type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  relatedId?: string
  userId: string
}

type NotificationFilters = {
  isRead?: boolean
  type?: NotificationType
  startDate?: string
  endDate?: string
}

type NotificationsResponse = {
  notifications: Notification[]
  unreadCount: number
}

/**
 * Hook for fetching notifications
 */
export function useNotifications(filters?: NotificationFilters) {
  return useApi<NotificationsResponse>("/api/notifications", filters as any)
}

/**
 * Hook for marking a notification as read
 */
export function useMarkNotificationRead(notificationId: string) {
  return useApiMutation<Notification, void>(
    `/api/notifications/${notificationId}/read`,
    "PUT"
  )
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsRead() {
  return useApiMutation<{ message: string; updated: number }, void>(
    "/api/notifications/read-all",
    "PUT"
  )
}

