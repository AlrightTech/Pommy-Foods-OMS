"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Search, Eye, User, MapPin } from "lucide-react"
import Link from "next/link"
import type { DeliveryStatus } from "@/types"

interface Delivery {
  id: string
  orderNumber: string
  storeName: string
  deliveryAddress: string
  scheduledDate: Date
  status: DeliveryStatus
  driverName?: string
}

interface DeliveriesListProps {
  deliveries: Delivery[]
  drivers?: Array<{ id: string; name: string }>
  onAssignDriver?: (deliveryId: string, driverId: string) => void
}

const statusConfig: Record<DeliveryStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_TRANSIT: { label: "In Transit", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  FAILED: { label: "Failed", variant: "secondary" },
}

export function DeliveriesList({
  deliveries,
  drivers = [],
  onAssignDriver,
}: DeliveriesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.storeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search deliveries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[200px]"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-foreground/60">
                  No deliveries found
                </TableCell>
              </TableRow>
            ) : (
              filteredDeliveries.map((delivery) => {
                const status = statusConfig[delivery.status]
                return (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.orderNumber}</TableCell>
                    <TableCell>{delivery.storeName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-foreground/60">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm truncate max-w-[200px]">
                          {delivery.deliveryAddress}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/60">
                      {delivery.scheduledDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {delivery.driverName ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-foreground/60" />
                          <span className="text-sm">{delivery.driverName}</span>
                        </div>
                      ) : delivery.status === "PENDING" && drivers.length > 0 ? (
                        <Select
                          onChange={(e) => onAssignDriver?.(delivery.id, e.target.value)}
                          className="w-[150px] text-xs"
                          defaultValue=""
                        >
                          <option value="">Assign Driver</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-foreground/40">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/deliveries/${delivery.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

