"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, MapPin, Phone, Mail, DollarSign, Calendar, Loader2 } from "lucide-react"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useStore } from "@/hooks/use-stores"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

export default function StoreDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const { data: store, loading: storeLoading, refetch: refetchStore } = useStore(storeId)
  
  // Fetch store orders
  const { data: orders, loading: ordersLoading } = useApi<any[]>(
    `/api/stores/${storeId}/orders`
  )
  
  // Fetch store invoices
  const { data: invoices, loading: invoicesLoading } = useApi<any[]>(
    `/api/invoices`,
    { storeId }
  )
  
  // Fetch store stock
  const { data: stock, loading: stockLoading } = useApi<any[]>(
    `/api/stores/${storeId}/stock`
  )
  
  const toast = useToast()

  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    )
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Store not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    )
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
                <h1 className="text-3xl font-bold text-gradient-gold">{store.name}</h1>
                <Badge variant={store.isActive ? "default" : "secondary"}>
                  {store.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-foreground/60">Store Details & Management</p>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Store
          </Button>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Store Information</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>

          {/* Store Information Tab */}
          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Contact Name</p>
                      <p className="font-semibold">{store.contactName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Email</p>
                      <p className="font-semibold">{store.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Phone</p>
                      <p className="font-semibold">{store.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Address</p>
                      <p className="font-semibold">
                        {store.address}, {store.city}, {store.region}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                    <div>
                      <p className="text-sm text-foreground/60">Credit Limit</p>
                      <p className="text-2xl font-bold text-gradient-gold">
                        ${(store.creditLimit || 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-gold" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                    <div>
                      <p className="text-sm text-foreground/60">Payment Terms</p>
                      <p className="text-2xl font-bold">{store.paymentTerms || 0} days</p>
                    </div>
                    <Calendar className="w-8 h-8 text-gold" />
                  </div>

                  <div className="p-4 rounded-xl glass border border-gold/20">
                    <p className="text-sm text-foreground/60 mb-1">Created</p>
                    <p className="font-semibold">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>All orders for this store</CardDescription>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber || order.id}
                          </TableCell>
                          <TableCell className="text-foreground/60">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${Number(order.totalAmount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-foreground/60">
                    <p>No orders found for this store</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>All invoices for this store</CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber || invoice.id}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${Number(invoice.totalAmount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-foreground/60">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === "PAID" ? "success" : "default"}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-foreground/60">
                    <p>No invoices found for this store</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Current stock levels for this store</CardDescription>
              </CardHeader>
              <CardContent>
                {stockLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                ) : stock && stock.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Level</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stock.map((item: any, index: number) => {
                        const isLowStock = (item.currentLevel || 0) < (item.threshold || 0)
                        return (
                          <TableRow key={item.id || index}>
                            <TableCell className="font-medium">
                              {item.product?.name || "Unknown Product"}
                            </TableCell>
                            <TableCell>{item.currentLevel || 0}</TableCell>
                            <TableCell>{item.threshold || 0}</TableCell>
                            <TableCell>
                              <Badge variant={isLowStock ? "destructive" : "success"}>
                                {isLowStock ? "Low Stock" : "OK"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-foreground/60">
                    <p>No stock data found for this store</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
