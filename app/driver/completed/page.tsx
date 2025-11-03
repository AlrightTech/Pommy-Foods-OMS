"use client"

import { DriverLayout } from "@/components/layout/driver-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Package, CheckCircle2 } from "lucide-react"

// Mock completed deliveries
const mockCompletedDeliveries = [
  {
    id: "1",
    orderNumber: "ORD-001",
    storeName: "Convenience Store A",
    address: "123 Main St, New York, NY",
    completedAt: new Date("2024-01-15T10:30:00"),
    itemsCount: 5,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    storeName: "Restaurant B",
    address: "456 Oak Ave, Los Angeles, CA",
    completedAt: new Date("2024-01-14T14:20:00"),
    itemsCount: 8,
  },
]

export default function DriverCompletedPage() {
  return (
    <DriverLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">Completed Deliveries</h1>

        <div className="space-y-4">
          {mockCompletedDeliveries.map((delivery) => (
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
                          {delivery.completedAt.toLocaleString()}
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
      </div>
    </DriverLayout>
  )
}

