"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import type { OrderStatus } from "@/types"

// Mock orders
const mockOrders = [
  {
    id: "ORD-001",
    orderNumber: "ORD-001",
    status: "PENDING" as OrderStatus,
    totalAmount: 450.0,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "ORD-002",
    orderNumber: "ORD-002",
    status: "APPROVED" as OrderStatus,
    totalAmount: 320.0,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "ORD-003",
    orderNumber: "ORD-003",
    status: "DELIVERED" as OrderStatus,
    totalAmount: 890.0,
    createdAt: new Date("2024-01-10"),
  },
]

export default function StoreOrdersPage() {
  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">My Orders</h1>
          <p className="text-foreground/60">View your order history and track status</p>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>All your orders from this store</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell className="text-foreground/60">
                      {order.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/store/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  )
}

