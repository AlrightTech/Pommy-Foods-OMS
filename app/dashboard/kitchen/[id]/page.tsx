"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KitchenItemCard } from "@/components/kitchen/kitchen-item-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

// Mock data
const mockKitchenSheet = {
  id: "1",
  orderNumber: "ORD-001",
  status: "IN_PROGRESS" as "PENDING" | "IN_PROGRESS" | "COMPLETED",
  createdAt: new Date("2024-01-15"),
  items: [
    {
      id: "1",
      productName: "Pommy Meal - Chicken",
      productSku: "PM-CH-001",
      quantity: 20,
      batchNumber: undefined,
      expiryDate: undefined,
      isPacked: false,
    },
    {
      id: "2",
      productName: "Pommy Meal - Beef",
      productSku: "PM-BF-001",
      quantity: 15,
      batchNumber: "BATCH-2024-001",
      expiryDate: new Date("2024-01-25"),
      isPacked: true,
      barcode: "BC120240115",
      qrCode: "QR120240115",
    },
  ],
}

export default function KitchenSheetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [sheet, setSheet] = useState(mockKitchenSheet)

  const handleItemUpdate = (itemId: string, updates: any) => {
    setSheet({
      ...sheet,
      items: sheet.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })
  }

  const handleCompleteSheet = () => {
    if (confirm("Mark this kitchen sheet as completed?")) {
      setSheet({
        ...sheet,
        status: "COMPLETED" as const,
      })
      // TODO: API call to complete sheet
    }
  }

  const allPacked = sheet.items.every((item) => item.isPacked)
  const canComplete = sheet.status !== "COMPLETED" && allPacked

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
                  {sheet.orderNumber}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheet.items.map((item) => (
            <KitchenItemCard
              key={item.id}
              item={item}
              onUpdate={handleItemUpdate}
              readonly={sheet.status === "COMPLETED"}
            />
          ))}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sheet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Total Items</p>
                <p className="text-2xl font-bold">{sheet.items.length}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Packed</p>
                <p className="text-2xl font-bold text-green-600">
                  {sheet.items.filter((i) => i.isPacked).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {sheet.items.filter((i) => !i.isPacked).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total Quantity</p>
                <p className="text-2xl font-bold">
                  {sheet.items.reduce((sum, i) => sum + i.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

