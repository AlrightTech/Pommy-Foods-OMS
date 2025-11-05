"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { StockTable } from "@/components/stock/stock-table"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useStock } from "@/hooks/use-stock"
import { useApiMutation } from "@/hooks/use-api"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

export default function StoreStockPage() {
  const { data: user } = useCurrentUser()
  const { data: stockItems, loading: stockLoading, refetch: refetchStock } = useStock(
    user?.storeId ? { storeId: user.storeId } : undefined
  )
  const toast = useToast()

  const handleUpdate = async (itemId: string, newLevel: number, currentItem?: any) => {
    try {
      const response = await fetch(`/api/stock/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentLevel: newLevel }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Failed to update stock")
      }
      
      toast.success("Stock updated successfully")
      refetchStock()
    } catch (error: any) {
      toast.error("Failed to update stock", error?.message || "Please try again")
    }
  }

  // Format stock items for the table
  const formattedStockItems = stockItems?.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || "Unknown Product",
    productSku: item.product?.sku || "N/A",
    currentLevel: item.currentLevel || 0,
    threshold: item.threshold || 0,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
    isLowStock: item.isLowStock || (item.currentLevel || 0) < (item.threshold || 0),
  })) || []

  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Stock Management</h1>
          <p className="text-foreground/60">Update and track your Pommy product stock levels</p>
        </div>

        {/* Stock Table */}
        {stockLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          </Card>
        ) : formattedStockItems.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-foreground/60">
              <p>No stock items found</p>
            </div>
          </Card>
        ) : (
          <Card>
            <StockTable
              stockItems={formattedStockItems}
              onUpdate={handleUpdate}
            />
          </Card>
        )}
      </div>
    </StoreLayout>
  )
}
