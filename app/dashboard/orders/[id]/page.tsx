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
import { ArrowLeft, Package, Store, Calendar, FileText, Edit, Loader2 } from "lucide-react"
import { useOrder, useApproveOrder, useRejectOrder } from "@/hooks/use-orders"
import { useToast } from "@/hooks/use-toast"
import type { OrderStatus, OrderType } from "@/types"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { data: order, loading: orderLoading, refetch: refetchOrder } = useOrder(orderId)
  const { mutate: approveOrder, loading: approveLoading } = useApproveOrder(orderId)
  const { mutate: rejectOrder, loading: rejectLoading } = useRejectOrder(orderId)
  const toast = useToast()
  
  const [isModifying, setIsModifying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [modifiedItems, setModifiedItems] = useState<any[]>([])

  const handleItemsChange = (items: Array<{ 
    id?: string
    productId: string
    productName: string
    productSku: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>) => {
    setModifiedItems(items)
  }

  const handleSaveChanges = async () => {
    if (!order) return
    
    setIsSaving(true)
    try {
      const itemsToSave = modifiedItems.length > 0 
        ? modifiedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        : (order as any).items?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })) || []
      
      const response = await fetch(`/api/orders/${orderId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: itemsToSave }),
      })
      
      if (response.ok) {
        toast.success("Order updated successfully")
        setIsModifying(false)
        setModifiedItems([])
        refetchOrder()
      } else {
        const error = await response.json()
        toast.error("Failed to update order", error?.error || "Please try again")
      }
    } catch (error: any) {
      toast.error("Failed to update order", error?.message || "Please try again")
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async (orderId: string) => {
    try {
      await approveOrder()
      toast.success("Order approved successfully")
      refetchOrder()
      router.push("/dashboard/orders")
    } catch (error: any) {
      toast.error("Failed to approve order", error?.message || "Please try again")
    }
  }

  const handleReject = async (orderId: string, reason?: string) => {
    try {
      await rejectOrder({ reason })
      toast.success("Order rejected")
      refetchOrder()
      router.push("/dashboard/orders")
    } catch (error: any) {
      toast.error("Failed to reject order", error?.message || "Please try again")
    }
  }

  // Format order items for the editor
  const formattedItems = (order as any)?.items?.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || "Unknown Product",
    productSku: item.product?.sku || "",
    quantity: item.quantity,
    unitPrice: Number(item.product?.price || 0),
    totalPrice: item.quantity * Number(item.product?.price || 0),
  })) || []

  const canEdit = order && (order.status === "DRAFT" || order.status === "PENDING")
  const isReadonly = !isModifying && !canEdit
  const isLoading = orderLoading || approveLoading || rejectLoading || isSaving

  if (orderLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Order not found</p>
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
                  {order.orderNumber || order.id}
                </h1>
                <OrderStatusBadge status={order.status as OrderStatus} />
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
                  setModifiedItems([])
                  refetchOrder()
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="glow-gold-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
                  items={modifiedItems.length > 0 && isModifying ? modifiedItems : formattedItems}
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
                    <p className="font-semibold">
                      {(order as any).store?.name || "Unknown Store"}
                    </p>
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
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Total Amount</p>
                    <p className="text-xl font-bold text-gradient-gold">
                      ${Number(order.totalAmount || 0).toFixed(2)}
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
