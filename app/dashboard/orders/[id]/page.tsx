"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrderItemsEditor } from "@/components/orders/order-items-editor"
import { ApprovalActions } from "@/components/orders/approval-actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Store, Calendar, FileText } from "lucide-react"
import type { OrderStatus, OrderType } from "@/types"

// Mock order data - will be replaced with API call
const mockOrder = {
  id: "1",
  orderNumber: "ORD-001",
  storeId: "1",
  storeName: "Convenience Store A",
  status: "PENDING" as OrderStatus,
  orderType: "AUTO_REPLENISH" as OrderType,
  totalAmount: 450.0,
  notes: "This is an auto-generated replenishment order",
  createdAt: new Date("2024-01-15"),
  items: [
    {
      id: "1",
      productId: "1",
      productName: "Pommy Meal - Chicken",
      productSku: "PM-CH-001",
      quantity: 20,
      unitPrice: 12.99,
      totalPrice: 259.8,
    },
    {
      id: "2",
      productId: "2",
      productName: "Pommy Meal - Beef",
      productSku: "PM-BF-001",
      quantity: 15,
      unitPrice: 14.99,
      totalPrice: 224.85,
    },
  ],
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(mockOrder)
  const [isModifying, setIsModifying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleItemsChange = (items: Array<{ id?: string; productId: string; productName: string; productSku: string; quantity: number; unitPrice: number; totalPrice: number }>) => {
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
    setOrder({ ...order, items: items.map(item => ({ ...item, id: item.id || `temp-${Date.now()}-${Math.random()}` })), totalAmount })
  }

  const handleApprove = async (orderId: string) => {
    setIsLoading(true)
    // TODO: API call to approve order
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setOrder({ ...order, status: "APPROVED" as OrderStatus })
    setIsLoading(false)
    router.push("/dashboard/orders")
  }

  const handleReject = async (orderId: string, reason?: string) => {
    setIsLoading(true)
    // TODO: API call to reject order
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setOrder({ ...order, status: "REJECTED" as OrderStatus })
    setIsLoading(false)
    router.push("/dashboard/orders")
  }

  const canEdit = order.status === "DRAFT" || order.status === "PENDING"
  const isReadonly = !isModifying && !canEdit

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gradient-gold">
                  {order.orderNumber}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-foreground/60">Order Details</p>
            </div>
          </div>
          {canEdit && !isModifying && (
            <Button onClick={() => setIsModifying(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Order
            </Button>
          )}
          {isModifying && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModifying(false)
                  setOrder(mockOrder) // Reset to original
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Save changes
                  setIsModifying(false)
                }}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {isModifying
                    ? "Modify items, quantities, or add/remove products"
                    : "Review order items"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderItemsEditor
                  items={order.items}
                  onItemsChange={handleItemsChange}
                  readonly={isReadonly}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 whitespace-pre-wrap">
                  {order.notes || "No notes for this order"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Store</p>
                    <p className="font-semibold">{order.storeName}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Order Type</p>
                    <p className="font-semibold">
                      {order.orderType === "AUTO_REPLENISH" ? "Auto Replenishment" : "Manual"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Created Date</p>
                    <p className="font-semibold">
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Total Amount</p>
                    <p className="text-xl font-bold text-gradient-gold">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Actions */}
            {(order.status === "PENDING" || order.status === "DRAFT") && !isModifying && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Review and approve or reject this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <ApprovalActions
                    orderId={order.id}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onModify={canEdit ? () => setIsModifying(true) : undefined}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

import { Edit } from "lucide-react"

