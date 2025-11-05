"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  address?: string
  onLocationChange: (lat: number, lng: number, address?: string) => void
  readonly?: boolean
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  onLocationChange,
  readonly = false,
}: LocationPickerProps) {
  const [lat, setLat] = useState(latitude?.toString() || "")
  const [lng, setLng] = useState(longitude?.toString() || "")
  const [addr, setAddr] = useState(address || "")

  useEffect(() => {
    if (latitude !== undefined) setLat(latitude.toString())
    if (longitude !== undefined) setLng(longitude.toString())
    if (address) setAddr(address)
  }, [latitude, longitude, address])

  const handleSave = () => {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    
    if (!isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
      onLocationChange(latNum, lngNum, addr || undefined)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-gold" />
          <h3 className="font-semibold">Location</h3>
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-64 bg-gradient-to-br from-[#FAF4EC] to-[#F5EDE0] rounded-xl border border-gold/20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-gold mx-auto opacity-50" />
              <p className="text-sm text-foreground/60">
                {latitude && longitude ? "Map will be displayed here" : "Select location on map"}
              </p>
              <p className="text-xs text-foreground/40">
                Google Maps integration required
              </p>
            </div>
          </div>
          {latitude && longitude && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-gold rounded-full border-2 border-white shadow-lg"></div>
            </div>
          )}
        </div>

        {!readonly && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g., 40.7128"
                  min="-90"
                  max="90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g., -74.0060"
                  min="-180"
                  max="180"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="Street address, city, etc."
              />
            </div>

            <Button onClick={handleSave} className="w-full" size="sm">
              Save Location
            </Button>
          </>
        )}

        {readonly && latitude && longitude && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Latitude:</span>
              <span className="font-mono">{latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Longitude:</span>
              <span className="font-mono">{longitude.toFixed(6)}</span>
            </div>
            {address && (
              <div className="pt-2 border-t border-gold/20">
                <span className="text-foreground/60">Address: </span>
                <span>{address}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

