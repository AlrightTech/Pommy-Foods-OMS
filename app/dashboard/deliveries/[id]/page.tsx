"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { ArrowLeft, Truck, MapPin, User, Calendar, Package } from "lucide-react"
import type { DeliveryStatus } from "@/types"

// Mock delivery data
const mockDelivery = {
  id: "1",
  orderNumber: "ORD-001",
  storeName: "Convenience Store A",
  deliveryAddress: "123 Main Street, New York, NY 10001",
  scheduledDate: new Date("2024-01-16"),
  status: "ASSIGNED" as DeliveryStatus,
  driverId: "1",
  driverName: "John Driver",
  items: [
    { productName: "Pommy Meal - Chicken", quantity: 20 },
    { productName: "Pommy Meal - Beef", quantity: 15 },
  ],
}

const mockDrivers = [
  { id: "1", name: "John Driver" },
  { id: "2", name: "Jane Driver" },
  { id: "3", name: "Bob Driver" },
]

export default function DeliveryDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [delivery, setDelivery] = useState(mockDelivery)

  const handleAssignDriver = (driverId: string) => {
    const driver = mockDrivers.find((d) => d.id === driverId)
    setDelivery({
      ...delivery,
      driverId,
      driverName: driver?.name || "",
      status: "ASSIGNED",
    })
    // TODO: API call to assign driver
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gradient-gold">
                  {delivery.orderNumber}
                </h1>
                <Badge
                  variant={
                    delivery.status === "DELIVERED"
                      ? "success"
                      : delivery.status === "ASSIGNED" || delivery.status === "IN_TRANSIT"
                      ? "default"
                      : "secondary"
                  }
                >
                  {delivery.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-foreground/60">Delivery Details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Store</p>
                    <p className="font-semibold">{delivery.storeName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Delivery Address</p>
                    <p className="font-semibold">{delivery.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Scheduled Date</p>
                    <p className="font-semibold">
                      {delivery.scheduledDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Items */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {delivery.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gold" />
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-foreground/60">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {delivery.driverName ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl glass border border-gold/20">
                    <User className="h-5 w-5 text-gold mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground/60">Assigned Driver</p>
                      <p className="font-semibold">{delivery.driverName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/60">Assign a driver</p>
                    <Select
                      onChange={(e) => handleAssignDriver(e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Select Driver</option>
                      {mockDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: View route on map
                    alert("Opening map view...")
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  View Route
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Track delivery
                    alert("Opening tracking view...")
                  }}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Track Delivery
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

import { Building } from "lucide-react"

