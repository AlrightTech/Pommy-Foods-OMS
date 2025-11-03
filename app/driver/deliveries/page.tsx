"use client"

import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Package, Navigation } from "lucide-react"
import Link from "next/link"
import type { DeliveryStatus } from "@/types"

// Mock deliveries
const mockDeliveries = [
  {
    id: "1",
    orderNumber: "ORD-001",
    storeName: "Convenience Store A",
    address: "123 Main St, New York, NY 10001",
    scheduledTime: "10:00 AM",
    itemsCount: 5,
    status: "ASSIGNED" as DeliveryStatus,
    distance: "2.5 km",
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    storeName: "Restaurant B",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    scheduledTime: "2:00 PM",
    itemsCount: 8,
    status: "ASSIGNED" as DeliveryStatus,
    distance: "5.1 km",
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    storeName: "Convenience Store C",
    address: "789 Elm St, Chicago, IL 60601",
    scheduledTime: "4:00 PM",
    itemsCount: 3,
    status: "IN_TRANSIT" as DeliveryStatus,
    distance: "1.8 km",
  },
]

export default function DriverDeliveriesPage() {
  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">My Deliveries</h1>

        <div className="space-y-4">
          {mockDeliveries.map((delivery) => (
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
                        <span className="text-foreground/70">{delivery.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-foreground/60" />
                        <span className="text-foreground/70">{delivery.itemsCount} items</span>
                      </div>
                      <span className="text-foreground/60">{delivery.distance}</span>
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
      </div>
    </DriverLayout>
  )
}

