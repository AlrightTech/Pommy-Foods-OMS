"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationList } from "./notification-list"
import { useRouter } from "next/navigation"
import { useNotifications, useMarkNotificationRead } from "@/hooks/use-notifications"
import { useToast } from "@/hooks/use-toast"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const toast = useToast()
  
  // Fetch recent notifications (last 10)
  const { data: notificationsData, loading: notificationsLoading, refetch: refetchNotifications } = useNotifications()
  
  const notifications = notificationsData?.notifications?.slice(0, 10) || []
  const unreadCount = notificationsData?.unreadCount || 0

  const { mutate: markAsRead } = useMarkNotificationRead("")

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [refetchNotifications])

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

  const handleNotificationClick = async (notification: any) => {
    setIsOpen(false)
    
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await markAsRead({}, `/api/notifications/${notification.id}/read`)
        refetchNotifications()
      } catch (error: any) {
        toast.error("Failed to mark as read", error?.message || "Please try again")
      }
    }
    
    // Navigate to related page based on type
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
          router.push("/dashboard/notifications")
      }
    } else {
      router.push("/dashboard/notifications")
    }
  }

  // Format notifications for NotificationList component
  const formattedNotifications = notifications.map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: new Date(n.createdAt),
    relatedId: n.relatedId,
  }))

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-foreground/70" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-gold to-gold-dark text-white text-xs font-semibold flex items-center justify-center glow-gold-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 z-50">
          <NotificationList
            notifications={formattedNotifications}
            onNotificationClick={handleNotificationClick}
            onViewAll={() => {
              setIsOpen(false)
              router.push("/dashboard/notifications")
            }}
            loading={notificationsLoading}
          />
        </div>
      )}
    </div>
  )
}
