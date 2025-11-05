"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"

interface DeliveryLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  status?: "pending" | "assigned" | "in_transit" | "delivered"
}

interface DeliveryMapProps {
  deliveries: DeliveryLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  onDeliveryClick?: (deliveryId: string) => void
}

export function DeliveryMap({
  deliveries,
  center,
  zoom = 12,
  onDeliveryClick,
}: DeliveryMapProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)

  // Calculate center from deliveries if not provided
  const mapCenter = center || (deliveries.length > 0
    ? {
        lat: deliveries.reduce((sum, d) => sum + d.latitude, 0) / deliveries.length,
        lng: deliveries.reduce((sum, d) => sum + d.longitude, 0) / deliveries.length,
      }
    : { lat: 0, lng: 0 })

  const handleDeliveryClick = (deliveryId: string) => {
    setSelectedDelivery(deliveryId === selectedDelivery ? null : deliveryId)
    onDeliveryClick?.(deliveryId)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "in_transit":
        return "bg-blue-500"
      case "assigned":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {/* Map Placeholder */}
        <div className="relative w-full h-[500px] bg-gradient-to-br from-[#FAF4EC] to-[#F5EDE0] rounded-xl border border-gold/20 overflow-hidden">
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D2AC6A" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Center Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-gold rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Navigation className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Delivery Markers */}
          {deliveries.map((delivery) => {
            // Simple positioning (in production, use proper map projection)
            const x = 50 + ((delivery.longitude - mapCenter.lng + 0.1) / 0.2) * 50
            const y = 50 + ((delivery.latitude - mapCenter.lat + 0.1) / 0.2) * 50

            return (
              <div
                key={delivery.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  selectedDelivery === delivery.id ? "z-10 scale-150" : "z-0"
                }`}
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`,
                }}
                onClick={() => handleDeliveryClick(delivery.id)}
              >
                <div className={`w-4 h-4 ${getStatusColor(delivery.status)} rounded-full border-2 border-white shadow-lg`} />
                {selectedDelivery === delivery.id && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-[150px] border border-gold/20">
                    <p className="text-xs font-semibold">{delivery.name}</p>
                    {delivery.address && (
                      <p className="text-xs text-foreground/60 mt-1">{delivery.address}</p>
                    )}
                    {delivery.status && (
                      <p className="text-xs text-foreground/40 mt-1 capitalize">{delivery.status.replace("_", " ")}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gold/20 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gold" />
              <p className="text-sm font-semibold">Delivery Locations</p>
            </div>
            <p className="text-xs text-foreground/60">
              {deliveries.length} {deliveries.length === 1 ? "delivery" : "deliveries"}
            </p>
            <p className="text-xs text-foreground/40 mt-2">
              Google Maps integration required for full functionality
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

