"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Plus } from "lucide-react"
import type { OrderStatus } from "@/types"

// Mock data
const mockOrders = [
  {
    id: "ORD-001",
    orderNumber: "ORD-001",
    storeId: "1",
    storeName: "Convenience Store A",
    status: "PENDING" as OrderStatus,
    totalAmount: 450.0,
    createdAt: new Date(),
    orderType: "MANUAL" as const,
  },
  {
    id: "ORD-002",
    orderNumber: "ORD-002",
    storeId: "2",
    storeName: "Restaurant B",
    status: "APPROVED" as OrderStatus,
    totalAmount: 1250.0,
    createdAt: new Date(),
    orderType: "AUTO_REPLENISH" as const,
  },
  {
    id: "ORD-003",
    orderNumber: "ORD-003",
    storeId: "3",
    storeName: "Convenience Store C",
    status: "DRAFT" as OrderStatus,
    totalAmount: 320.0,
    createdAt: new Date(),
    orderType: "AUTO_REPLENISH" as const,
  },
]

const mockStores = [
  { id: "1", name: "Convenience Store A" },
  { id: "2", name: "Restaurant B" },
  { id: "3", name: "Convenience Store C" },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [storeFilter, setStoreFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.storeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesStore = storeFilter === "all" || order.storeId === storeFilter
    return matchesSearch && matchesStatus && matchesStore
  })

  const ordersByTab = {
    all: filteredOrders,
    pending: filteredOrders.filter((o) => o.status === "PENDING" || o.status === "DRAFT"),
    approved: filteredOrders.filter((o) => o.status === "APPROVED"),
    completed: filteredOrders.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED"),
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Orders</h1>
            <p className="text-foreground/60">Manage and track all orders</p>
          </div>
          <Link href="/dashboard/orders/new">
            <Button className="glow-gold-sm">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          storeFilter={storeFilter}
          onStoreFilterChange={setStoreFilter}
          stores={mockStores}
          onReset={() => {
            setSearchTerm("")
            setStatusFilter("all")
            setStoreFilter("all")
          }}
        />

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage orders from all stores</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <OrdersTable orders={ordersByTab.all} />
              </TabsContent>
              <TabsContent value="pending">
                <OrdersTable orders={ordersByTab.pending} />
              </TabsContent>
              <TabsContent value="approved">
                <OrdersTable orders={ordersByTab.approved} />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersTable orders={ordersByTab.completed} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function OrdersTable({ orders }: { orders: typeof mockOrders }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order Number</TableHead>
          <TableHead>Store</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-foreground/60">
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{order.storeName}</TableCell>
              <TableCell>
                <span className="text-xs text-foreground/60">
                  {order.orderType === "AUTO_REPLENISH" ? "Auto" : "Manual"}
                </span>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-foreground/60">
                {order.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
