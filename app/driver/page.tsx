"use client"

import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, CheckCircle2, Navigation } from "lucide-react"
import Link from "next/link"

// Mock data
const nextDelivery = {
  id: "1",
  orderNumber: "ORD-001",
  storeName: "Convenience Store A",
  address: "123 Main St, New York, NY",
  scheduledTime: "10:00 AM",
  itemsCount: 5,
}

const todayStats = {
  assigned: 3,
  completed: 2,
  pending: 1,
}

export default function DriverDashboardPage() {
  return (
    <DriverLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Next Delivery */}
        {nextDelivery && (
          <Card className="border-gold/40 glow-gold-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Next Delivery</p>
                  <h2 className="text-2xl font-bold text-gradient-gold">
                    {nextDelivery.orderNumber}
                  </h2>
                  <p className="text-foreground/70 mt-1">{nextDelivery.storeName}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-foreground/60" />
                    <span>{nextDelivery.itemsCount} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-foreground/60" />
                    <span>{nextDelivery.scheduledTime}</span>
                  </div>
                </div>

                <Link href={`/driver/deliveries/${nextDelivery.id}`}>
                  <Button className="w-full glow-gold-sm" size="lg">
                    <Navigation className="mr-2 h-5 w-5" />
                    Start Delivery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-foreground/60 mb-1">Assigned</p>
              <p className="text-2xl font-bold">{todayStats.assigned}</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-foreground/60 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{todayStats.completed}</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-foreground/60 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{todayStats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/driver/deliveries">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">All Deliveries</span>
                </Button>
              </Link>
              <Link href="/driver/completed">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-sm">Completed</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DriverLayout>
  )
}

