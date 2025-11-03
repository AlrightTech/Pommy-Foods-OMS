"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation, MapPin, Target } from "lucide-react"

interface GPSTrackerProps {
  destination: {
    address: string
    latitude?: number
    longitude?: number
  }
  onNavigate?: () => void
}

export function GPSTracker({ destination, onNavigate }: GPSTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    if (isTracking && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("GPS error:", error)
        },
        { enableHighAccuracy: true }
      )

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isTracking])

  const handleStartTracking = () => {
    if (navigator.geolocation) {
      setIsTracking(true)
    } else {
      alert("GPS is not available on this device")
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">GPS Tracking</h3>
            <Button
              variant={isTracking ? "default" : "outline"}
              size="sm"
              onClick={handleStartTracking}
              disabled={isTracking}
            >
              {isTracking ? "Tracking..." : "Start GPS"}
            </Button>
          </div>

          <div className="space-y-3">
            {currentLocation && (
              <div className="p-3 rounded-xl glass border border-gold/20">
                <p className="text-xs text-foreground/60 mb-1">Current Location</p>
                <p className="text-sm font-medium">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl glass border border-gold/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-gold" />
                <p className="text-xs text-foreground/60">Destination</p>
              </div>
              <p className="text-sm font-medium">{destination.address}</p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="h-48 rounded-xl glass border border-gold/20 flex items-center justify-center bg-gradient-to-br from-gold/10 to-gold-dark/5">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gold opacity-50" />
              <p className="text-sm text-foreground/60">Map view will be rendered here</p>
              <p className="text-xs text-foreground/40 mt-1">
                (Google Maps integration)
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              onNavigate?.()
              // Open external navigation app
              if (destination.latitude && destination.longitude) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`,
                  "_blank"
                )
              }
            }}
            className="w-full glow-gold-sm"
          >
            <Navigation className="mr-2 h-5 w-5" />
            Navigate with Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

