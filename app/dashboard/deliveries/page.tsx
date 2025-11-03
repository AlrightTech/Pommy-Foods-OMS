"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DeliveriesCalendar } from "@/components/deliveries/deliveries-calendar"
import { DeliveriesList } from "@/components/deliveries/deliveries-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Truck, Calendar, List } from "lucide-react"
import type { DeliveryStatus } from "@/types"

// Mock data
const mockDeliveries = [
  {
    id: "1",
    orderNumber: "ORD-001",
    storeName: "Convenience Store A",
    deliveryAddress: "123 Main St, New York, NY 10001",
    scheduledDate: new Date("2024-01-16"),
    status: "ASSIGNED" as DeliveryStatus,
    driverName: "John Driver",
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    storeName: "Restaurant B",
    deliveryAddress: "456 Oak Ave, Los Angeles, CA 90001",
    scheduledDate: new Date("2024-01-16"),
    status: "IN_TRANSIT" as DeliveryStatus,
    driverName: "Jane Driver",
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    storeName: "Convenience Store C",
    deliveryAddress: "789 Elm St, Chicago, IL 60601",
    scheduledDate: new Date("2024-01-17"),
    status: "PENDING" as DeliveryStatus,
  },
]

const mockDrivers = [
  { id: "1", name: "John Driver" },
  { id: "2", name: "Jane Driver" },
  { id: "3", name: "Bob Driver" },
]

export default function DeliveriesPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleAssignDriver = (deliveryId: string, driverId: string) => {
    // TODO: API call to assign driver
    console.log("Assign driver", driverId, "to delivery", deliveryId)
  }

  const stats = {
    pending: mockDeliveries.filter((d) => d.status === "PENDING").length,
    assigned: mockDeliveries.filter((d) => d.status === "ASSIGNED").length,
    inTransit: mockDeliveries.filter((d) => d.status === "IN_TRANSIT").length,
    delivered: mockDeliveries.filter((d) => d.status === "DELIVERED").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Deliveries</h1>
          <p className="text-foreground/60">Track and manage all deliveries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center text-yellow-600 glow-gold-sm">
                  <Truck className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Assigned</p>
                  <p className="text-2xl font-bold text-foreground">{stats.assigned}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
                  <Truck className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">In Transit</p>
                  <p className="text-2xl font-bold text-foreground">{stats.inTransit}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold glow-gold-sm">
                  <Truck className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Delivered</p>
                  <p className="text-2xl font-bold text-foreground">{stats.delivered}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 glow-gold-sm">
                  <Truck className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Delivery Management</CardTitle>
                <CardDescription>View and manage all deliveries</CardDescription>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
                <TabsList>
                  <TabsTrigger value="list">
                    <List className="mr-2 h-4 w-4" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
              <TabsContent value="list" className="mt-0">
                <DeliveriesList
                  deliveries={mockDeliveries}
                  drivers={mockDrivers}
                  onAssignDriver={handleAssignDriver}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-0">
                <DeliveriesCalendar
                  deliveries={mockDeliveries}
                  onDateClick={(date) => {
                    setSelectedDate(date)
                    setViewMode("list")
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
