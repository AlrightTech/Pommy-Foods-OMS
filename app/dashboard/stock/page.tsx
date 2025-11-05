"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { StockOverview } from "@/components/stock/stock-overview"
import { StockTable } from "@/components/stock/stock-table"
import { Select } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useStock, useUpdateStock } from "@/hooks/use-stock"
import { useStores } from "@/hooks/use-stores"
import { useToast } from "@/hooks/use-toast"

export default function StockPage() {
  const [selectedStore, setSelectedStore] = useState("all")
  
  const { data: stock, loading: stockLoading, refetch: refetchStock } = useStock(
    selectedStore !== "all" ? { storeId: selectedStore } : undefined
  )
  
  const { data: stores, loading: storesLoading } = useStores()
  const { mutate: updateStock, loading: updateLoading } = useUpdateStock()
  const toast = useToast()

  const handleUpdate = async (itemId: string, newLevel: number, currentItem: any) => {
    try {
      await updateStock({
        storeId: currentItem.storeId,
        productId: currentItem.productId,
        currentLevel: newLevel,
        threshold: currentItem.threshold,
      })
      toast.success("Stock updated successfully")
      refetchStock()
    } catch (error: any) {
      toast.error("Failed to update stock", error?.message || "Please try again")
    }
  }

  const handleBulkUpdate = () => {
    // TODO: Open bulk update dialog
    toast.info("Bulk update feature coming soon")
  }

  // Calculate low stock items
  const lowStockItems = useMemo(() => {
    if (!stock) return []
    
    return stock
      .filter((item: any) => item.isLowStock || (item.currentLevel || 0) < (item.threshold || 0))
      .map((item: any) => ({
        storeId: item.storeId,
        storeName: item.store?.name || "Unknown Store",
        productId: item.productId,
        productName: item.product?.name || "Unknown Product",
        currentLevel: item.currentLevel || 0,
        threshold: item.threshold || 0,
        isLowStock: true,
      }))
  }, [stock])

  // Format stores for dropdown
  const storeOptions = useMemo(() => {
    const allStores = [{ id: "all", name: "All Stores" }]
    if (stores) {
      return [...allStores, ...stores.map((s: any) => ({ id: s.id, name: s.name }))]
    }
    return allStores
  }, [stores])

  // Format stock items for table
  const formattedStockItems = useMemo(() => {
    if (!stock) return []
    
    return stock.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || "Unknown Product",
      productSku: item.product?.sku || "",
      currentLevel: item.currentLevel || 0,
      threshold: item.threshold || 0,
      lastUpdated: new Date(item.lastUpdated || item.updatedAt || Date.now()),
      isLowStock: item.isLowStock || (item.currentLevel || 0) < (item.threshold || 0),
      storeId: item.storeId,
      storeName: item.store?.name,
    }))
  }, [stock])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Stock Management</h1>
            <p className="text-foreground/60">Monitor and manage stock levels across all stores</p>
          </div>
          {storesLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          ) : (
            <Select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-[250px]"
            >
              {storeOptions.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Stock Overview */}
        {stockLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          </Card>
        ) : (
          <StockOverview
            lowStockItems={lowStockItems}
            totalStores={stores?.length || 0}
            totalProducts={stock ? new Set(stock.map((s: any) => s.productId)).size : 0}
          />
        )}

        {/* Stock Table */}
        <Card>
          {stockLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : (
            <StockTable
              stockItems={formattedStockItems}
              onUpdate={(itemId, newLevel, currentItem) => handleUpdate(itemId, newLevel, currentItem)}
              onBulkUpdate={handleBulkUpdate}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
