"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { StockOverview } from "@/components/stock/stock-overview"
import { StockTable } from "@/components/stock/stock-table"
import { Select } from "@/components/ui/select"
import { useState } from "react"

// Mock data
const mockLowStockItems = [
  {
    storeId: "1",
    storeName: "Convenience Store A",
    productId: "1",
    productName: "Pommy Meal - Chicken",
    currentLevel: 5,
    threshold: 20,
    isLowStock: true,
  },
  {
    storeId: "2",
    storeName: "Restaurant B",
    productId: "2",
    productName: "Pommy Meal - Beef",
    currentLevel: 0,
    threshold: 15,
    isLowStock: true,
  },
]

const mockStockItems = [
  {
    id: "1",
    productId: "1",
    productName: "Pommy Meal - Chicken",
    productSku: "PM-CH-001",
    currentLevel: 25,
    threshold: 20,
    lastUpdated: new Date(),
    isLowStock: false,
  },
  {
    id: "2",
    productId: "2",
    productName: "Pommy Meal - Beef",
    productSku: "PM-BF-001",
    currentLevel: 5,
    threshold: 20,
    lastUpdated: new Date(),
    isLowStock: true,
  },
  {
    id: "3",
    productId: "3",
    productName: "Pommy Meal - Vegetarian",
    productSku: "PM-VEG-001",
    currentLevel: 30,
    threshold: 15,
    lastUpdated: new Date(),
    isLowStock: false,
  },
]

const mockStores = [
  { id: "all", name: "All Stores" },
  { id: "1", name: "Convenience Store A" },
  { id: "2", name: "Restaurant B" },
  { id: "3", name: "Convenience Store C" },
]

export default function StockPage() {
  const [selectedStore, setSelectedStore] = useState("all")
  const [stockItems, setStockItems] = useState(mockStockItems)

  const handleUpdate = async (itemId: string, newLevel: number) => {
    // TODO: API call to update stock
    setStockItems(
      stockItems.map((item) =>
        item.id === itemId
          ? { ...item, currentLevel: newLevel, isLowStock: newLevel <= item.threshold }
          : item
      )
    )
  }

  const handleBulkUpdate = () => {
    // TODO: Open bulk update dialog
    alert("Bulk update feature coming soon")
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Stock Management</h1>
            <p className="text-foreground/60">Monitor and manage stock levels across all stores</p>
          </div>
          <Select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-[250px]"
          >
            {mockStores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Stock Overview */}
        <StockOverview
          lowStockItems={mockLowStockItems}
          totalStores={3}
          totalProducts={3}
        />

        {/* Stock Table */}
        <Card>
          <StockTable
            stockItems={stockItems}
            onUpdate={handleUpdate}
            onBulkUpdate={handleBulkUpdate}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}

