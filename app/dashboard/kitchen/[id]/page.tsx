"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KitchenItemCard } from "@/components/kitchen/kitchen-item-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { useKitchenSheet, useUpdateKitchenItem, useCompleteKitchenSheet } from "@/hooks/use-kitchen"
import { useToast } from "@/hooks/use-toast"

export default function KitchenSheetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sheetId = params.id as string
  const { data: sheet, loading, refetch } = useKitchenSheet(sheetId)
  const { mutate: updateItem } = useUpdateKitchenItem(sheetId)
  const { mutate: completeSheet } = useCompleteKitchenSheet(sheetId)
  const toast = useToast()

  const handleItemUpdate = async (itemId: string, updates: any) => {
    try {
      await updateItem(itemId, updates)
      toast.success("Item updated successfully")
      refetch()
    } catch (error: any) {
      toast.error("Failed to update item", error?.message || "Please try again")
    }
  }

  const handleCompleteSheet = async () => {
    if (confirm("Mark this kitchen sheet as completed?")) {
      try {
        await completeSheet()
        toast.success("Kitchen sheet completed successfully")
        refetch()
      } catch (error: any) {
        toast.error("Failed to complete sheet", error?.message || "Please try again")
      }
    }
  }

  // Format items for KitchenItemCard
  const formattedItems = sheet?.items?.map((item: any) => ({
    id: item.id,
    productName: item.product?.name || "Unknown Product",
    productSku: item.product?.sku || "",
    quantity: item.quantity,
    batchNumber: item.batchNumber || undefined,
    expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
    isPacked: item.isPacked || false,
    barcode: item.barcode || undefined,
    qrCode: item.qrCode || undefined,
  })) || []

  const allPacked = formattedItems.length > 0 && formattedItems.every((item) => item.isPacked)
  const canComplete = sheet && sheet.status !== "COMPLETED" && allPacked

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    )
  }

  if (!sheet) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Kitchen sheet not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gradient-gold">
                  {sheet.order?.orderNumber || "N/A"}
                </h1>
                <Badge
                  variant={
                    sheet.status === "COMPLETED"
                      ? "success"
                      : sheet.status === "IN_PROGRESS"
                      ? "default"
                      : "secondary"
                  }
                >
                  {sheet.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-foreground/60">Kitchen Preparation Sheet</p>
            </div>
          </div>
          {canComplete && (
            <Button onClick={handleCompleteSheet} className="glow-gold-sm">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Sheet
            </Button>
          )}
        </div>

        {/* Items Grid */}
        {formattedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formattedItems.map((item) => (
              <KitchenItemCard
                key={item.id}
                item={item}
                onUpdate={(itemId, updates) => handleItemUpdate(itemId, updates)}
                readonly={sheet.status === "COMPLETED"}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-foreground/60">No items in this kitchen sheet</p>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sheet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Total Items</p>
                <p className="text-2xl font-bold">{formattedItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Packed</p>
                <p className="text-2xl font-bold text-green-600">
                  {formattedItems.filter((i) => i.isPacked).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formattedItems.filter((i) => !i.isPacked).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total Quantity</p>
                <p className="text-2xl font-bold">
                  {formattedItems.reduce((sum, i) => sum + i.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
