"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, MapPin, Phone, Mail, DollarSign, Calendar } from "lucide-react"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data
const mockStore = {
  id: "1",
  name: "Convenience Store A",
  contactName: "John Doe",
  email: "john@storea.com",
  phone: "+1 234-567-8900",
  address: "123 Main Street",
  city: "New York",
  region: "NYC",
  creditLimit: 5000,
  paymentTerms: 30,
  isActive: true,
  createdAt: new Date("2023-01-15"),
}

const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-001",
    status: "DELIVERED" as const,
    totalAmount: 450.0,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    status: "APPROVED" as const,
    totalAmount: 320.0,
    createdAt: new Date("2024-01-14"),
  },
]

const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    status: "PAID" as const,
    totalAmount: 450.0,
    dueDate: new Date("2024-01-20"),
    paidAt: new Date("2024-01-18"),
  },
]

const mockStock = [
  {
    productName: "Pommy Meal - Chicken",
    currentLevel: 25,
    threshold: 20,
    isLowStock: false,
  },
  {
    productName: "Pommy Meal - Beef",
    currentLevel: 5,
    threshold: 20,
    isLowStock: true,
  },
]

export default function StoreDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [store] = useState(mockStore)

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
                        ${store.creditLimit.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-gold" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20">
                    <div>
                      <p className="text-sm text-foreground/60">Payment Terms</p>
                      <p className="text-2xl font-bold">{store.paymentTerms} days</p>
                    </div>
                    <Calendar className="w-8 h-8 text-gold" />
                  </div>

                  <div className="p-4 rounded-xl glass border border-gold/20">
                    <p className="text-sm text-foreground/60 mb-1">Created</p>
                    <p className="font-semibold">
                      {store.createdAt.toLocaleDateString()}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell className="font-semibold">
                          ${invoice.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-foreground/60">
                          {invoice.dueDate.toLocaleDateString()}
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
                    {mockStock.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.currentLevel}</TableCell>
                        <TableCell>{item.threshold}</TableCell>
                        <TableCell>
                          <Badge variant={item.isLowStock ? "destructive" : "success"}>
                            {item.isLowStock ? "Low Stock" : "OK"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

