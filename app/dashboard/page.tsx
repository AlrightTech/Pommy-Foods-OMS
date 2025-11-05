"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Users,
  DollarSign,
  Clock,
  Plus,
  FileText,
  Store,
  Loader2
} from "lucide-react"
import { useDashboardStats, useRecentOrders } from "@/hooks/use-dashboard"
import { useSalesAnalytics } from "@/hooks/use-analytics"
import { SalesChart } from "@/components/charts/sales-chart"
import { useToast } from "@/hooks/use-toast"
import { useMemo } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { stats, loading: statsLoading } = useDashboardStats()
  const { recentOrders, loading: ordersLoading } = useRecentOrders(4)
  const { data: salesData, loading: salesLoading } = useSalesAnalytics({
    groupBy: "day",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  })
  const toast = useToast()
  
  // Extract time series data for chart
  const salesChartData = useMemo(() => {
    return salesData?.timeSeries || []
  }, [salesData])

  const handleNewOrder = () => {
    router.push("/dashboard/orders/new")
  }

  const handleAddProduct = () => {
    router.push("/dashboard/products")
  }

  const handleViewReports = () => {
    router.push("/dashboard/analytics")
  }

  const handleManageStores = () => {
    router.push("/dashboard/stores")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const statsConfig = [
    {
      name: "Pending Orders",
      value: stats?.pendingOrders?.toString() || "0",
      change: null, // Pending orders don't need percentage change
      icon: Clock,
      color: "text-yellow-600",
      bgGradient: "from-yellow-500/20 to-yellow-600/10",
    },
    {
      name: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue || 0),
      change: stats?.todayRevenueChange || null,
      icon: DollarSign,
      color: "text-green-600",
      bgGradient: "from-green-500/20 to-green-600/10",
    },
    {
      name: "Active Products",
      value: stats?.activeProducts?.toString() || "0",
      change: null, // Products/stores changes require historical tracking
      icon: Package,
      color: "text-gold",
      bgGradient: "from-gold/20 to-gold-dark/10",
    },
    {
      name: "Active Stores",
      value: stats?.activeStores?.toString() || "0",
      change: null, // Products/stores changes require historical tracking
      icon: Users,
      color: "text-blue-600",
      bgGradient: "from-blue-500/20 to-blue-600/10",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Dashboard</h1>
          <p className="text-foreground/60">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.name} className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground/60 mb-1">{stat.name}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        {stat.change && (
                          <p className={`text-xs font-medium mt-1 ${
                            stat.change.startsWith("+") ? "text-green-600" : "text-red-600"
                          }`}>
                            {stat.change}
                          </p>
                        )}
                      </div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center ${stat.color} glow-gold-sm`}>
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest order activities across all stores</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{order.orderNumber}</p>
                        <p className="text-sm text-foreground/60">{order.store}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{order.amount}</p>
                        <p className="text-xs text-foreground/60">{order.time}</p>
                      </div>
                      <Badge
                        variant={
                          order.status === "DELIVERED" || order.status === "COMPLETED"
                            ? "success"
                            : order.status === "PENDING" || order.status === "DRAFT"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/60">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Chart Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleNewOrder}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gold to-gold-dark text-white font-medium hover:scale-105 transition-all duration-300 glow-gold-sm active:scale-95"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>New Order</span>
                </Button>
                <Button
                  onClick={handleAddProduct}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 glass border border-gold/20 text-foreground font-medium hover:scale-105 transition-all duration-300 hover:border-gold/40 active:scale-95 hover:bg-gold/10"
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Product</span>
                </Button>
                <Button
                  onClick={handleViewReports}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 glass border border-gold/20 text-foreground font-medium hover:scale-105 transition-all duration-300 hover:border-gold/40 active:scale-95 hover:bg-gold/10"
                >
                  <FileText className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
                <Button
                  onClick={handleManageStores}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 glass border border-gold/20 text-foreground font-medium hover:scale-105 transition-all duration-300 hover:border-gold/40 active:scale-95 hover:bg-gold/10"
                >
                  <Store className="h-6 w-6" />
                  <span>Manage Stores</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <SalesChart data={salesChartData} loading={salesLoading} />
        </div>
      </div>
    </DashboardLayout>
  )
}
