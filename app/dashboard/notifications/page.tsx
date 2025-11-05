"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications"
import { useToast } from "@/hooks/use-toast"

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
  const router = useRouter()
  const toast = useToast()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  
  const { data: notificationsData, loading: notificationsLoading, refetch: refetchNotifications } = useNotifications(
    filter === "unread" ? { isRead: false } : undefined
  )
  
  const notifications = useMemo(() => {
    return notificationsData?.notifications || []
  }, [notificationsData])

  const unreadCount = notificationsData?.unreadCount || 0

  const { mutate: markAllAsRead, loading: markAllReadLoading } = useMarkAllNotificationsRead()

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include",
      })
      if (response.ok) {
        toast.success("Notification marked as read")
        refetchNotifications()
      } else {
        throw new Error("Failed to mark as read")
      }
    } catch (error: any) {
      toast.error("Failed to mark as read", error?.message || "Please try again")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success("All notifications marked as read")
      refetchNotifications()
    } catch (error: any) {
      toast.error("Failed to mark all as read", error?.message || "Please try again")
    }
  }

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    // Navigate to related page
    if (notification.relatedId) {
      switch (notification.type) {
        case "ORDER_APPROVED":
        case "ORDER_REJECTED":
          router.push(`/dashboard/orders/${notification.relatedId}`)
          break
        case "DELIVERY_ASSIGNED":
          router.push(`/dashboard/deliveries`)
          break
        case "PAYMENT_RECEIVED":
        case "INVOICE_GENERATED":
          router.push(`/dashboard/invoices/${notification.relatedId}`)
          break
        case "STOCK_LOW":
          router.push("/dashboard/stock")
          break
        case "TEMPERATURE_ALERT":
          router.push("/dashboard/temperature")
          break
        default:
          break
      }
    }
  }

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
            <Button 
              onClick={handleMarkAllAsRead} 
              variant="outline"
              disabled={markAllReadLoading}
            >
              {markAllReadLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                "Mark All as Read"
              )}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>View and manage your notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-foreground/60">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => {
                    const Icon = typeIcons[notification.type as keyof typeof typeIcons]
                    const iconColor = typeColors[notification.type as keyof typeof typeColors]
                    const createdAt = new Date(notification.createdAt)

                    return (
                      <div
                        key={notification.id}
                        className={`
                          flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01]
                          ${notification.isRead
                            ? "glass border-gold/20 hover:border-gold/30"
                            : "bg-gold/5 border-gold/40 glass"}
                        `}
                        onClick={() => handleNotificationClick(notification)}
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
                            {formatDistanceToNow(createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
