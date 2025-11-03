"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { StockTable } from "@/components/stock/stock-table"
import { Card } from "@/components/ui/card"

// Mock data - store-specific stock
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

export default function StoreStockPage() {
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

  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Stock Management</h1>
          <p className="text-foreground/60">Update and track your Pommy product stock levels</p>
        </div>

        {/* Stock Table */}
        <Card>
          <StockTable
            stockItems={stockItems}
            onUpdate={handleUpdate}
          />
        </Card>
      </div>
    </StoreLayout>
  )
}

import { useState } from "react"

