"use client"

import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notifications/notification-bell"

// Mock notifications - in production, fetch from API
const mockNotifications = [
  {
    id: "1",
    title: "New Order Approved",
    message: "Order ORD-001 has been approved and is ready for kitchen preparation.",
    type: "ORDER_APPROVED" as const,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000),
    relatedId: "1",
  },
  {
    id: "2",
    title: "Delivery Assigned",
    message: "You have been assigned to delivery DEL-001 to Convenience Store A.",
    type: "DELIVERY_ASSIGNED" as const,
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60000),
    relatedId: "1",
  },
  {
    id: "3",
    title: "Low Stock Alert",
    message: "Pommy Meal - Beef is running low at Restaurant B (5 units remaining).",
    type: "STOCK_LOW" as const,
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60000),
  },
]

export function Header() {

  return (
    <header className="sticky top-0 z-40 w-full glass-dark border-b border-gold/20">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search orders, products, stores..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/50 border border-gold/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all duration-300 text-sm font-medium placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationBell notifications={mockNotifications} />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gold/20">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">John Doe</p>
              <p className="text-xs text-foreground/60">Admin</p>
            </div>
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-white/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-sm">
                <User className="w-5 h-5 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

