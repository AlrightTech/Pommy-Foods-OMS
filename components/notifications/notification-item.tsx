"use client"

import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Truck,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: "ORDER_APPROVED" | "ORDER_REJECTED" | "DELIVERY_ASSIGNED" | "PAYMENT_RECEIVED" | "INVOICE_GENERATED" | "STOCK_LOW" | "TEMPERATURE_ALERT"
  isRead: boolean
  createdAt: Date
  relatedId?: string
}

interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
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

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = typeIcons[notification.type]
  const iconColor = typeColors[notification.type]

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
        notification.isRead
          ? "glass border-gold/20 hover:border-gold/30"
          : "bg-gold/5 border-gold/40 glass hover:border-gold/50"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0",
          iconColor
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-sm">{notification.title}</p>
          {!notification.isRead && (
            <Badge variant="default" className="text-xs glow-gold-sm">
              New
            </Badge>
          )}
        </div>
        <p className="text-sm text-foreground/70 mb-2">{notification.message}</p>
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}

