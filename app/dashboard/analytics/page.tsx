"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Package, Users, DollarSign, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSalesAnalytics, useProductAnalytics, useStoreAnalytics, useDeliveryMetrics } from "@/hooks/use-analytics"
import { useDashboardStats } from "@/hooks/use-dashboard"
import { ProductPerformanceChart } from "@/components/charts/product-performance-chart"
import { SalesChart } from "@/components/charts/sales-chart"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { data: salesData, loading: salesLoading } = useSalesAnalytics()
  const { data: productData, loading: productLoading } = useProductAnalytics()
  const { data: storeData, loading: storeLoading } = useStoreAnalytics()
  const { data: deliveryData, loading: deliveryLoading } = useDeliveryMetrics()
  const toast = useToast()

  const handleExport = (format: "pdf" | "excel") => {
    toast.info(`Export to ${format.toUpperCase()} will be implemented soon`)
  }

  // Format sales data for chart
  const salesChartData = salesData?.timeSeries?.map((point: any) => ({
    date: point.date,
    revenue: Number(point.revenue || 0),
    orders: Number(point.orders || 0),
  })) || []

  // Format top products
  const topProducts = productData?.slice(0, 3).map((product: any) => ({
    name: product.productName,
    sales: Number(product.revenue || 0),
    quantity: product.quantity || 0,
  })) || []

  // Format top stores
  const topStores = storeData?.slice(0, 3).map((store: any) => ({
    name: store.storeName,
    sales: Number(store.revenue || 0),
    orders: store.orders || 0,
  })) || []

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Analytics & Reports</h1>
            <p className="text-foreground/60">View detailed analytics and generate reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {statsLoading ? (
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
                    <p className="text-sm font-medium text-foreground/60 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${salesData ? Number(salesData.totalRevenue || 0).toFixed(2) : "0.00"}
                    </p>
                    <p className="text-xs font-medium text-green-600 mt-1">+12.5%</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold glow-gold-sm">
                    <DollarSign className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">
                      {salesData ? salesData.totalOrders || 0 : stats.pendingOrders + stats.activeStores}
                    </p>
                    <p className="text-xs font-medium text-green-600 mt-1">+8.2%</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Products Sold</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.activeProducts}
                    </p>
                    <p className="text-xs font-medium text-green-600 mt-1">+15.3%</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 glow-gold-sm">
                    <Package className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Active Stores</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeStores}</p>
                    <p className="text-xs font-medium text-green-600 mt-1">+3</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-purple-600 glow-gold-sm">
                    <Users className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Reports */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {salesLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SalesChart
                data={salesChartData}
                loading={salesLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="products">
            {productLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best selling products by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topProducts.length > 0 ? (
                      <div className="space-y-4">
                        {topProducts.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl glass border border-gold/20"
                          >
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm text-foreground/60">
                                {product.quantity} units sold
                              </p>
                            </div>
                            <p className="text-lg font-bold text-gradient-gold">
                              ${product.sales.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-foreground/60">
                        No product data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <ProductPerformanceChart 
                  data={productData ?? undefined} 
                  loading={productLoading} 
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="stores">
            {storeLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Stores</CardTitle>
                  <CardDescription>Stores ranked by sales and order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  {topStores.length > 0 ? (
                    <div className="space-y-4">
                      {topStores.map((store, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold-dark text-white text-xs font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <p className="font-semibold">{store.name}</p>
                            </div>
                            <p className="text-sm text-foreground/60">
                              {store.orders} orders
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gradient-gold">
                            ${store.sales.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground/60">
                      No store data available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deliveries">
            {deliveryLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Performance</CardTitle>
                  <CardDescription>On-time delivery metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl glass border border-gold/20">
                      <p className="text-3xl font-bold text-gradient-gold">
                        {deliveryData ? `${(deliveryData.onTimeRate || 0).toFixed(0)}%` : "0%"}
                      </p>
                      <p className="text-sm text-foreground/60 mt-2">On-Time Rate</p>
                    </div>
                    <div className="text-center p-6 rounded-xl glass border border-gold/20">
                      <p className="text-3xl font-bold text-gradient-gold">
                        {deliveryData ? `${(deliveryData.averageDeliveryTime || 0).toFixed(1)}h` : "0h"}
                      </p>
                      <p className="text-sm text-foreground/60 mt-2">Avg Delivery Time</p>
                    </div>
                    <div className="text-center p-6 rounded-xl glass border border-gold/20">
                      <p className="text-3xl font-bold text-gradient-gold">
                        {deliveryData ? deliveryData.totalDeliveries || 0 : 0}
                      </p>
                      <p className="text-sm text-foreground/60 mt-2">Total Deliveries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
