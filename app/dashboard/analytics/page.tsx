"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SalesChart } from "@/components/analytics/sales-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Package, Users, DollarSign } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const mockSalesData = [
  { date: "2024-01-09", sales: 1200 },
  { date: "2024-01-10", sales: 1800 },
  { date: "2024-01-11", sales: 1500 },
  { date: "2024-01-12", sales: 2200 },
  { date: "2024-01-13", sales: 1900 },
  { date: "2024-01-14", sales: 2500 },
  { date: "2024-01-15", sales: 2100 },
]

const topProducts = [
  { name: "Pommy Meal - Chicken", sales: 450, quantity: 150 },
  { name: "Pommy Meal - Beef", sales: 380, quantity: 120 },
  { name: "Pommy Meal - Vegetarian", sales: 290, quantity: 100 },
]

const topStores = [
  { name: "Convenience Store A", sales: 1250, orders: 25 },
  { name: "Restaurant B", sales: 980, orders: 18 },
  { name: "Convenience Store C", sales: 750, orders: 15 },
]

export default function AnalyticsPage() {
  const handleExport = (format: "pdf" | "excel") => {
    alert(`Exporting to ${format.toUpperCase()}...`)
  }

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">$14,200</p>
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
                  <p className="text-2xl font-bold text-foreground">248</p>
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
                  <p className="text-2xl font-bold text-foreground">1,250</p>
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
                  <p className="text-2xl font-bold text-foreground">48</p>
                  <p className="text-xs font-medium text-green-600 mt-1">+3</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-purple-600 glow-gold-sm">
                  <Users className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Reports */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesChart
              data={mockSalesData}
              title="Sales Overview"
              description="Daily sales performance over time"
            />
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
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
                          ${product.sales}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Visual chart placeholder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-foreground/40">
                    <p>Product performance chart will be rendered here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Stores</CardTitle>
                <CardDescription>Stores ranked by sales and order volume</CardDescription>
              </CardHeader>
              <CardContent>
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
                        ${store.sales}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>On-time delivery metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl glass border border-gold/20">
                    <p className="text-3xl font-bold text-gradient-gold">95%</p>
                    <p className="text-sm text-foreground/60 mt-2">On-Time Rate</p>
                  </div>
                  <div className="text-center p-6 rounded-xl glass border border-gold/20">
                    <p className="text-3xl font-bold text-gradient-gold">2.5h</p>
                    <p className="text-sm text-foreground/60 mt-2">Avg Delivery Time</p>
                  </div>
                  <div className="text-center p-6 rounded-xl glass border border-gold/20">
                    <p className="text-3xl font-bold text-gradient-gold">248</p>
                    <p className="text-sm text-foreground/60 mt-2">Total Deliveries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
