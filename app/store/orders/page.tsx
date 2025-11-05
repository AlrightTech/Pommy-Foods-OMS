"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useOrders } from "@/hooks/use-orders"
import { useCurrentUser } from "@/hooks/use-user"
import { format } from "date-fns"

export default function StoreOrdersPage() {
  const { data: user } = useCurrentUser()
  
  // Fetch store's orders
  const { data: orders, loading: ordersLoading } = useOrders(
    user?.storeId ? { storeId: user.storeId } : undefined
  )

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
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : orders && orders.length > 0 ? (
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
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber || order.id}
                      </TableCell>
                      <TableCell className="text-foreground/60">
                        {order.createdAt ? format(new Date(order.createdAt), "PPP") : "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(order.totalAmount || 0).toFixed(2)}
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
            ) : (
              <div className="text-center py-12 text-foreground/60">
                <p>No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  )
}
