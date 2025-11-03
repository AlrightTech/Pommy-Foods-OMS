"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationList } from "./notification-list"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  type: "ORDER_APPROVED" | "ORDER_REJECTED" | "DELIVERY_ASSIGNED" | "PAYMENT_RECEIVED" | "INVOICE_GENERATED" | "STOCK_LOW" | "TEMPERATURE_ALERT"
  isRead: boolean
  createdAt: Date
  relatedId?: string
}

interface NotificationBellProps {
  notifications?: Notification[]
  unreadCount?: number
}

export function NotificationBell({ notifications = [], unreadCount }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Calculate unread count if not provided
  const count = unreadCount ?? notifications.filter((n) => !n.isRead).length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false)
    
    // Navigate to related page based on type
    if (notification.relatedId) {
      switch (notification.type) {
        case "ORDER_APPROVED":
        case "ORDER_REJECTED":
          router.push(`/dashboard/orders/${notification.relatedId}`)
          break
        case "DELIVERY_ASSIGNED":
          router.push(`/dashboard/deliveries/${notification.relatedId}`)
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
          router.push("/dashboard/notifications")
      }
    } else {
      router.push("/dashboard/notifications")
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-foreground/70" />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-gold to-gold-dark text-white text-xs font-semibold flex items-center justify-center glow-gold-sm animate-pulse">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 z-50">
          <NotificationList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onViewAll={() => {
              setIsOpen(false)
              router.push("/dashboard/notifications")
            }}
          />
        </div>
      )}
    </div>
  )
}

