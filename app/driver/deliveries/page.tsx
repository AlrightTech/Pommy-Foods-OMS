"use client"

import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Package, Navigation, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDeliveries } from "@/hooks/use-deliveries"
import { useCurrentUser } from "@/hooks/use-user"
import type { DeliveryStatus } from "@/types"

export default function DriverDeliveriesPage() {
  const { data: user } = useCurrentUser()
  
  // Fetch driver's deliveries
  const { data: deliveries, loading: deliveriesLoading } = useDeliveries(
    user?.id ? { driverId: user.id } : undefined
  )

  // Format deliveries for display
  const formattedDeliveries = deliveries?.map((delivery: any) => ({
    id: delivery.id,
    orderNumber: delivery.order?.orderNumber || delivery.id,
    storeName: delivery.store?.name || "Unknown Store",
    address: delivery.deliveryAddress,
    scheduledTime: delivery.scheduledDate
      ? new Date(delivery.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "N/A",
    scheduledDate: delivery.scheduledDate
      ? new Date(delivery.scheduledDate).toLocaleDateString()
      : "N/A",
    itemsCount: 0, // Could fetch from order if needed
    status: delivery.status as DeliveryStatus,
    distance: "N/A", // Would need to calculate from GPS
  })) || []

  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">My Deliveries</h1>

        {deliveriesLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : formattedDeliveries.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-foreground/60">
                <p>No deliveries assigned</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {formattedDeliveries.map((delivery) => (
              <Card key={delivery.id} className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gradient-gold">
                            {delivery.orderNumber}
                          </h3>
                          <Badge
                            variant={
                              delivery.status === "DELIVERED"
                                ? "success"
                                : delivery.status === "IN_TRANSIT"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {delivery.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground mb-1">{delivery.storeName}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-foreground/60 flex-shrink-0" />
                        <span className="text-foreground/70 flex-1">{delivery.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-foreground/60" />
                          <span className="text-foreground/70">
                            {delivery.scheduledTime} - {delivery.scheduledDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-foreground/60" />
                          <span className="text-foreground/70">{delivery.itemsCount} items</span>
                        </div>
                        {delivery.distance !== "N/A" && (
                          <span className="text-foreground/60">{delivery.distance}</span>
                        )}
                      </div>
                    </div>

                    <Link href={`/driver/deliveries/${delivery.id}`}>
                      <Button className="w-full glow-gold-sm" size="lg">
                        {delivery.status === "IN_TRANSIT" ? (
                          <>
                            <Navigation className="mr-2 h-5 w-5" />
                            Continue Delivery
                          </>
                        ) : (
                          <>
                            <Navigation className="mr-2 h-5 w-5" />
                            Start Delivery
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DriverLayout>
  )
}
