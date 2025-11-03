"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bell,
  ShoppingCart,
  Truck,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: "ORDER_APPROVED" | "ORDER_REJECTED" | "DELIVERY_ASSIGNED" | "PAYMENT_RECEIVED" | "INVOICE_GENERATED" | "STOCK_LOW" | "TEMPERATURE_ALERT"
  isRead: boolean
  createdAt: Date
  relatedId?: string
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Order Approved",
    message: "Order ORD-001 has been approved and is ready for kitchen preparation",
    type: "ORDER_APPROVED",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    relatedId: "ORD-001",
  },
  {
    id: "2",
    title: "Delivery Assigned",
    message: "Delivery for ORD-002 has been assigned to driver John Driver",
    type: "DELIVERY_ASSIGNED",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    relatedId: "ORD-002",
  },
  {
    id: "3",
    title: "Low Stock Alert",
    message: "Pommy Meal - Chicken is running low at Convenience Store A (5 units remaining)",
    type: "STOCK_LOW",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    relatedId: "1",
  },
  {
    id: "4",
    title: "Payment Received",
    message: "Payment of $450.00 received for invoice INV-001",
    type: "PAYMENT_RECEIVED",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    relatedId: "INV-001",
  },
  {
    id: "5",
    title: "Invoice Generated",
    message: "Invoice INV-003 has been generated for order ORD-003",
    type: "INVOICE_GENERATED",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    relatedId: "INV-003",
  },
]

const typeIcons = {
  ORDER_APPROVED: CheckCircle2,
  ORDER_REJECTED: AlertCircle,
  DELIVERY_ASSIGNED: Truck,
  PAYMENT_RECEIVED: DollarSign,
  INVOICE_GENERATED: DollarSign,
  STOCK_LOW: Package,
  TEMPERATURE_ALERT: AlertCircle,
}

const typeColors = {
  ORDER_APPROVED: "text-green-600",
  ORDER_REJECTED: "text-red-600",
  DELIVERY_ASSIGNED: "text-blue-600",
  PAYMENT_RECEIVED: "text-green-600",
  INVOICE_GENERATED: "text-gold",
  STOCK_LOW: "text-yellow-600",
  TEMPERATURE_ALERT: "text-red-600",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Notifications</h1>
            <p className="text-foreground/60">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>View and manage your notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-foreground/60">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type]
                  const iconColor = typeColors[notification.type]

                  return (
                    <div
                      key={notification.id}
                      className={`
                        flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                        ${notification.isRead
                          ? "glass border-gold/20 hover:border-gold/30"
                          : "bg-gold/5 border-gold/40 glass"}
                      `}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0 ${iconColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`font-semibold ${notification.isRead ? "text-foreground/70" : "text-foreground"
                              }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p
                          className={`text-sm ${notification.isRead ? "text-foreground/60" : "text-foreground/80"
                            }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-foreground/40 mt-2">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

