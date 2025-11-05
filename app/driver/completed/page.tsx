"use client"

import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Package, CheckCircle2, Loader2 } from "lucide-react"
import { useDeliveries } from "@/hooks/use-deliveries"
import { useCurrentUser } from "@/hooks/use-user"

export default function DriverCompletedPage() {
  const { data: user } = useCurrentUser()
  
  // Fetch driver's completed deliveries
  const { data: deliveries, loading: deliveriesLoading } = useDeliveries(
    user?.id ? { driverId: user.id, status: "DELIVERED" } : undefined
  )

  // Format completed deliveries
  const completedDeliveries = deliveries?.map((delivery: any) => ({
    id: delivery.id,
    orderNumber: delivery.order?.orderNumber || delivery.id,
    storeName: delivery.store?.name || "Unknown Store",
    address: delivery.deliveryAddress,
    completedAt: delivery.deliveredAt || delivery.updatedAt || delivery.createdAt,
    itemsCount: delivery.order?.items?.length || 0,
  })) || []

  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">Completed Deliveries</h1>

        {deliveriesLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : completedDeliveries.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-foreground/60">
                <p>No completed deliveries found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedDeliveries.map((delivery) => (
              <Card key={delivery.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gradient-gold">
                          {delivery.orderNumber}
                        </h3>
                        <p className="font-semibold text-foreground">{delivery.storeName}</p>
                      </div>
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-foreground/60 flex-shrink-0" />
                        <span className="text-foreground/70">{delivery.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-foreground/60" />
                          <span className="text-foreground/70">
                            {new Date(delivery.completedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-foreground/60" />
                          <span className="text-foreground/70">{delivery.itemsCount} items</span>
                        </div>
                      </div>
                    </div>
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
