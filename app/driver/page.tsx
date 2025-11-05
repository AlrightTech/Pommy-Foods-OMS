"use client"

import { useMemo } from "react"
import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, CheckCircle2, Navigation, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDeliveries } from "@/hooks/use-deliveries"
import { useCurrentUser } from "@/hooks/use-user"

export default function DriverDashboardPage() {
  const { data: user } = useCurrentUser()
  
  // Fetch driver's deliveries
  const { data: deliveries, loading: deliveriesLoading } = useDeliveries(
    user?.id ? { driverId: user.id } : undefined
  )

  // Get next delivery (first ASSIGNED or IN_TRANSIT)
  const nextDelivery = useMemo(() => {
    if (!deliveries) return null
    
    const next = deliveries.find(
      (d: any) => d.status === "ASSIGNED" || d.status === "IN_TRANSIT"
    )
    
    if (!next) return null
    
    return {
      id: next.id,
      orderNumber: next.order?.orderNumber || next.id,
      storeName: next.store?.name || "Unknown Store",
      address: next.deliveryAddress,
      scheduledTime: next.scheduledDate 
        ? new Date(next.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "N/A",
      itemsCount: 0, // Will need to fetch from order if needed
    }
  }, [deliveries])

  // Calculate today's stats
  const todayStats = useMemo(() => {
    if (!deliveries) return { assigned: 0, completed: 0, pending: 0 }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayDeliveries = deliveries.filter((d: any) => {
      const deliveryDate = new Date(d.scheduledDate || d.createdAt)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() === today.getTime()
    })
    
    return {
      assigned: todayDeliveries.filter((d: any) => d.status === "ASSIGNED").length,
      completed: todayDeliveries.filter((d: any) => d.status === "DELIVERED").length,
      pending: todayDeliveries.filter((d: any) => 
        d.status === "ASSIGNED" || d.status === "IN_TRANSIT"
      ).length,
    }
  }, [deliveries])

  return (
    <DriverLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Next Delivery */}
        {deliveriesLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : nextDelivery ? (
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
                    <span>{nextDelivery.itemsCount || 0} items</span>
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
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-foreground/60">
                <p>No upcoming deliveries</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Stats */}
        {deliveriesLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="w-5 h-5 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
        )}

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
