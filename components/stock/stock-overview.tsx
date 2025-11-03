"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, Package } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface StockItem {
  storeId: string
  storeName: string
  productId: string
  productName: string
  currentLevel: number
  threshold: number
  isLowStock: boolean
}

interface StockOverviewProps {
  lowStockItems: StockItem[]
  totalStores: number
  totalProducts: number
}

export function StockOverview({
  lowStockItems,
  totalStores,
  totalProducts,
}: StockOverviewProps) {
  const criticalItems = lowStockItems.filter((item) => item.currentLevel === 0)
  const warningItems = lowStockItems.filter(
    (item) => item.currentLevel > 0 && item.currentLevel <= item.threshold
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/60 mb-1">
                Low Stock Alerts
              </p>
              <p className="text-2xl font-bold text-foreground">
                {lowStockItems.length}
              </p>
              <p className="text-xs font-medium text-yellow-600 mt-1">
                {warningItems.length} warnings, {criticalItems.length} critical
              </p>
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
              <p className="text-sm font-medium text-foreground/60 mb-1">
                Active Stores
              </p>
              <p className="text-2xl font-bold text-foreground">{totalStores}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
              <Package className="w-7 h-7" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/60 mb-1">
                Tracked Products
              </p>
              <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold glow-gold-sm">
              <TrendingDown className="w-7 h-7" />
            </div>
          </div>
        </CardContent>
      </Card>

      {lowStockItems.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items that need replenishment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => {
                const percentage = (item.currentLevel / item.threshold) * 100
                const isCritical = item.currentLevel === 0

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl glass border border-gold/20 hover:border-gold/40 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">
                            {item.productName}
                          </p>
                          <Badge
                            variant={isCritical ? "destructive" : "default"}
                          >
                            {isCritical ? "Out of Stock" : "Low Stock"}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/60">
                          {item.storeName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground/60">Current</p>
                        <p
                          className={`font-bold ${
                            isCritical ? "text-red-600" : "text-yellow-600"
                          }`}
                        >
                          {item.currentLevel} / {item.threshold}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={isCritical ? "h-2" : "h-2"}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

