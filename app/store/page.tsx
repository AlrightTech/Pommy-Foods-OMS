"use client"

import { useMemo } from "react"
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-user"
import { useOrders } from "@/hooks/use-orders"
import { useInvoices } from "@/hooks/use-invoices"
import { useStock } from "@/hooks/use-stock"
import { useProducts } from "@/hooks/use-products"

export default function StoreDashboardPage() {
  const { data: user } = useCurrentUser()
  
  // Fetch store's orders
  const { data: orders, loading: ordersLoading } = useOrders(
    user?.storeId ? { storeId: user.storeId } : undefined
  )
  
  // Fetch store's invoices
  const { data: invoices, loading: invoicesLoading } = useInvoices(
    user?.storeId ? { storeId: user.storeId } : undefined
  )
  
  // Fetch store's stock
  const { data: stock, loading: stockLoading } = useStock(
    user?.storeId ? { storeId: user.storeId } : undefined
  )
  
  // Fetch products
  const { data: products } = useProducts()

  // Calculate low stock items
  const lowStockItems = useMemo(() => {
    if (!stock) return []
    
    return stock
      .filter((item: any) => item.isLowStock || (item.currentLevel || 0) < (item.threshold || 0))
      .map((item: any) => ({
        productName: item.product?.name || "Unknown Product",
        currentLevel: item.currentLevel || 0,
        threshold: item.threshold || 0,
      }))
  }, [stock])

  // Get pending orders
  const pendingOrders = useMemo(() => {
    if (!orders) return []
    return orders
      .filter((o: any) => o.status === "PENDING" || o.status === "DRAFT")
      .slice(0, 5)
      .map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || order.id,
        status: order.status,
        amount: Number(order.totalAmount || 0),
        createdAt: new Date(order.createdAt),
      }))
  }, [orders])

  // Get recent orders for display
  const recentOrders = useMemo(() => {
    if (!orders) return []
    return orders.slice(0, 5).map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber || order.id,
      status: order.status,
      amount: Number(order.totalAmount || 0),
      createdAt: new Date(order.createdAt),
    }))
  }, [orders])

  // Get payment alerts (overdue and due soon invoices)
  const paymentAlerts = useMemo(() => {
    if (!invoices) return []
    
    const now = new Date()
    return invoices
      .filter((inv: any) => {
        if (!inv.dueDate) return false
        const dueDate = new Date(inv.dueDate)
        const isOverdue = dueDate < now && inv.status !== "PAID"
        const isDueSoon = dueDate >= now && dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) && inv.status !== "PAID"
        return isOverdue || isDueSoon
      })
      .map((inv: any) => ({
        invoiceNumber: inv.invoiceNumber || inv.id,
        amount: Number(inv.totalAmount || 0),
        dueDate: new Date(inv.dueDate || inv.createdAt),
        isOverdue: new Date(inv.dueDate || inv.createdAt) < now && inv.status !== "PAID",
      }))
  }, [invoices])

  // Calculate overdue amount
  const overdueAmount = useMemo(() => {
    return paymentAlerts
      .filter((alert) => alert.isOverdue)
      .reduce((sum, alert) => sum + alert.amount, 0)
  }, [paymentAlerts])

  const isLoading = ordersLoading || invoicesLoading || stockLoading

  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Store Dashboard</h1>
          <p className="text-foreground/60">Welcome back! Here&apos;s your store overview.</p>
        </div>

        {/* Quick Stats */}
        {isLoading ? (
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
                    <p className="text-sm font-medium text-foreground/60 mb-1">Low Stock Items</p>
                    <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
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
                    <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
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
                      ${overdueAmount.toFixed(2)}
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
                    <p className="text-2xl font-bold text-foreground">{products?.length || 0}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold glow-gold-sm">
                    <Package className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : lowStockItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need replenishment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
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
        ) : null}

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
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20 hover:border-gold/40 transition-all"
                  >
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-foreground/60">
                        {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">${order.amount.toFixed(2)}</p>
                      <Badge
                        variant={order.status === "APPROVED" || order.status === "DELIVERED" ? "success" : "default"}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Alerts */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : paymentAlerts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment Due</CardTitle>
              <CardDescription>Invoices requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentAlerts.map((alert, index) => (
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
        ) : null}
      </div>
    </StoreLayout>
  )
}
