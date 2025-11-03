"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Plus,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

// Mock data
const mockLowStock = [
  { productName: "Pommy Meal - Chicken", currentLevel: 5, threshold: 20 },
  { productName: "Pommy Meal - Beef", currentLevel: 8, threshold: 15 },
]

const mockPendingOrders = [
  { id: "ORD-001", status: "PENDING", amount: 450, createdAt: new Date("2024-01-15") },
  { id: "ORD-002", status: "APPROVED", amount: 320, createdAt: new Date("2024-01-14") },
]

const mockPaymentAlerts = [
  { invoiceNumber: "INV-001", amount: 450, dueDate: new Date("2024-01-20"), isOverdue: false },
  { invoiceNumber: "INV-002", amount: 320, dueDate: new Date("2024-01-10"), isOverdue: true },
]

export default function StoreDashboardPage() {
  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Store Dashboard</h1>
          <p className="text-foreground/60">Welcome back! Here&apos;s your store overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Low Stock Items</p>
                  <p className="text-2xl font-bold text-foreground">{mockLowStock.length}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center text-yellow-600 glow-gold-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Pending Orders</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockPendingOrders.filter((o) => o.status === "PENDING").length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
                  <ShoppingCart className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Payment Due</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${mockPaymentAlerts.filter((a) => a.isOverdue).length > 0 ? "320" : "0"}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center text-red-600 glow-gold-sm">
                  <DollarSign className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Active Products</p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold glow-gold-sm">
                  <Package className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/store/products">
                <Button className="w-full h-20 flex-col gap-2 glow-gold-sm">
                  <Plus className="h-6 w-6" />
                  <span>Place New Order</span>
                </Button>
              </Link>
              <Link href="/store/stock">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span>Update Stock</span>
                </Button>
              </Link>
              <Link href="/store/orders">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span>View Orders</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        {mockLowStock.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need replenishment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLowStock.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl glass border border-yellow-500/30"
                  >
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-foreground/60">
                        Current: {item.currentLevel} / Threshold: {item.threshold}
                      </p>
                    </div>
                    <Link href="/store/products">
                      <Button size="sm" variant="outline">
                        Order Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest order activities</CardDescription>
              </div>
              <Link href="/store/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20 hover:border-gold/40 transition-all"
                >
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-foreground/60">
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">${order.amount.toFixed(2)}</p>
                    <Badge
                      variant={order.status === "APPROVED" ? "success" : "default"}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Alerts */}
        {mockPaymentAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Due</CardTitle>
              <CardDescription>Invoices requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPaymentAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      alert.isOverdue
                        ? "glass border-red-500/30 bg-red-50/30"
                        : "glass border-yellow-500/30"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{alert.invoiceNumber}</p>
                      <p className="text-sm text-foreground/60">
                        Due: {alert.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">${alert.amount.toFixed(2)}</p>
                      <Badge variant={alert.isOverdue ? "destructive" : "default"}>
                        {alert.isOverdue ? "Overdue" : "Due Soon"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StoreLayout>
  )
}

