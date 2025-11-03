"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  ShoppingCart,
  Truck,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
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

interface NotificationListProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onViewAll: () => void
}

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

export function NotificationList({
  notifications,
  onNotificationClick,
  onViewAll,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Card className="glass-dark border-gold/30 shadow-xl max-h-[500px] overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-gold/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="default" className="glow-gold-sm">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4 text-foreground/60">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/10">
            {notifications.slice(0, 5).map((notification) => {
              const Icon = typeIcons[notification.type]
              const iconColor = typeColors[notification.type]

              return (
                <button
                  key={notification.id}
                  onClick={() => onNotificationClick(notification)}
                  className={`
                    w-full flex items-start gap-3 p-4 text-left transition-all duration-200
                    ${notification.isRead
                      ? "hover:bg-white/30"
                      : "bg-gold/5 hover:bg-gold/10"}
                  `}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0 ${iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-foreground/70 line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
      {notifications.length > 5 && (
        <div className="p-3 border-t border-gold/20">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={onViewAll}
          >
            View All Notifications
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}

