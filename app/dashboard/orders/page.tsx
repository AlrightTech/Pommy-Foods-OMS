"use client"

import { useState, useMemo } from "react"
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
import { Eye, Plus, Loader2 } from "lucide-react"
import { useOrders } from "@/hooks/use-orders"
import { useStores } from "@/hooks/use-stores"
import type { OrderStatus } from "@/types"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [storeFilter, setStoreFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch orders and stores dynamically
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useOrders()
  const { data: stores, loading: storesLoading } = useStores()

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    
    return orders.filter((order: any) => {
      const orderNumber = order.orderNumber || order.id || ""
      const storeName = order.store?.name || ""
      
      const matchesSearch =
        orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        storeName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesStore = storeFilter === "all" || order.storeId === storeFilter
      
      return matchesSearch && matchesStatus && matchesStore
    })
  }, [orders, searchTerm, statusFilter, storeFilter])

  const ordersByTab = useMemo(() => {
    return {
      all: filteredOrders,
      pending: filteredOrders.filter((o: any) => o.status === "PENDING" || o.status === "DRAFT"),
      approved: filteredOrders.filter((o: any) => o.status === "APPROVED"),
      completed: filteredOrders.filter((o: any) => o.status === "COMPLETED" || o.status === "DELIVERED"),
    }
  }, [filteredOrders])

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
          stores={stores || []}
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
            {ordersLoading || storesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Orders ({ordersByTab.all.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending Review ({ordersByTab.pending.length})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({ordersByTab.approved.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({ordersByTab.completed.length})</TabsTrigger>
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function OrdersTable({ orders }: { orders: any[] }) {
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
          orders.map((order: any) => {
            const orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
            const totalAmount = Number(order.totalAmount || 0)
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.orderNumber || order.id}
                </TableCell>
                <TableCell>{order.store?.name || "Unknown Store"}</TableCell>
                <TableCell>
                  <span className="text-xs text-foreground/60">
                    {order.orderType === "AUTO_REPLENISH" ? "Auto" : "Manual"}
                  </span>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </TableCell>
                <TableCell>${totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-foreground/60">
                  {orderDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/orders/${order.id}`}>
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
  )
}
