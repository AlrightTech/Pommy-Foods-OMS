"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DeliveriesCalendar } from "@/components/deliveries/deliveries-calendar"
import { DeliveriesList } from "@/components/deliveries/deliveries-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Calendar, List, Loader2 } from "lucide-react"
import { useDeliveries, useAssignDriver } from "@/hooks/use-deliveries"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

// Fetch drivers (users with DRIVER role)
function useDrivers() {
  return useApi<Array<{ id: string; name: string }>>("/api/users", { role: "DRIVER" })
}

export default function DeliveriesPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { data: deliveries, loading: deliveriesLoading, refetch: refetchDeliveries } = useDeliveries()
  const { data: drivers, loading: driversLoading } = useDrivers()
  const { mutate: assignDriver } = useAssignDriver("")
  const toast = useToast()

  const handleAssignDriver = async (deliveryId: string, driverId: string) => {
    try {
      await assignDriver({ driverId }, `/api/deliveries/${deliveryId}/assign`)
      toast.success("Driver assigned successfully")
      refetchDeliveries()
    } catch (error: any) {
      toast.error("Failed to assign driver", error?.message || "Please try again")
    }
  }

  const stats = useMemo(() => {
    if (!deliveries) return { pending: 0, assigned: 0, inTransit: 0, delivered: 0 }
    
    return {
      pending: deliveries.filter((d: any) => d.status === "PENDING").length,
      assigned: deliveries.filter((d: any) => d.status === "ASSIGNED").length,
      inTransit: deliveries.filter((d: any) => d.status === "IN_TRANSIT").length,
      delivered: deliveries.filter((d: any) => d.status === "DELIVERED").length,
    }
  }, [deliveries])

  // Format deliveries for components
  const formattedDeliveries = useMemo(() => {
    if (!deliveries) return []
    
    return deliveries.map((delivery: any) => ({
      id: delivery.id,
      orderNumber: delivery.order?.orderNumber || delivery.orderNumber || "N/A",
      storeName: delivery.store?.name || delivery.storeName || "Unknown Store",
      deliveryAddress: delivery.deliveryAddress || "",
      scheduledDate: new Date(delivery.scheduledDate || delivery.createdAt),
      status: delivery.status,
      driverId: delivery.driverId,
      driverName: delivery.driver?.name || delivery.driverName || undefined,
    }))
  }, [deliveries])

  const formattedDrivers = drivers || []

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Deliveries</h1>
          <p className="text-foreground/60">Track and manage all deliveries</p>
        </div>

        {/* Stats */}
        {deliveriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
        )}

        {/* View Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Delivery Management</CardTitle>
                <CardDescription>View and manage all deliveries</CardDescription>
              </div>
              <Tabs value={viewMode} defaultValue="list" onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
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
            {deliveriesLoading || driversLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
              <Tabs defaultValue={viewMode} value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
                <TabsContent value="list" className="mt-0">
                  <DeliveriesList
                    deliveries={formattedDeliveries}
                    drivers={formattedDrivers}
                    onAssignDriver={handleAssignDriver}
                  />
                </TabsContent>
                <TabsContent value="calendar" className="mt-0">
                  <DeliveriesCalendar
                    deliveries={formattedDeliveries}
                    onDateClick={(date) => {
                      setSelectedDate(date)
                      setViewMode("list")
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
