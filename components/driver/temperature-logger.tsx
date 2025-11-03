"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Thermometer } from "lucide-react"

interface TemperatureLoggerProps {
  onLog: (temperature: number, location: string, notes?: string) => Promise<void>
}

export function TemperatureLogger({ onLog }: TemperatureLoggerProps) {
  const [temperature, setTemperature] = useState("")
  const [location, setLocation] = useState("fridge")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    const temp = parseFloat(temperature)
    if (isNaN(temp)) {
      alert("Please enter a valid temperature")
      return
    }

    setIsLoading(true)
    try {
      await onLog(temp, location, notes || undefined)
      setTemperature("")
      setNotes("")
      alert("Temperature logged successfully!")
    } catch (error) {
      console.error("Temperature logging error:", error)
      alert("Failed to log temperature")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-5 w-5 text-gold" />
            <h3 className="font-semibold">Log Temperature</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C) *</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Enter temperature"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="fridge">Fridge (2-8°C)</option>
                <option value="freezer">Freezer (-18 to -12°C)</option>
                <option value="ambient">Ambient (15-25°C)</option>
                <option value="vehicle">Delivery Vehicle</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !temperature}
              className="w-full glow-gold-sm"
            >
              {isLoading ? "Logging..." : "Log Temperature"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

