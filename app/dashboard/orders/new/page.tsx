"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderItemsEditor } from "@/components/orders/order-items-editor"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useStores } from "@/hooks/use-stores"
import { useCreateOrder } from "@/hooks/use-orders"
import { useToast } from "@/hooks/use-toast"
import type { OrderType } from "@/types"

interface OrderItem {
  id?: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const { data: stores, loading: storesLoading } = useStores()
  const { mutate: createOrder, loading: createLoading } = useCreateOrder()
  const toast = useToast()
  
  const [storeId, setStoreId] = useState("")
  const [orderType, setOrderType] = useState<OrderType>("MANUAL")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState("")
  const isLoading = createLoading

  const handleItemsChange = (items: OrderItem[]) => {
    setOrderItems(items)
  }

  const handleSubmit = async () => {
    if (!storeId) {
      toast.error("Store Required", "Please select a store")
      return
    }

    if (orderItems.length === 0) {
      toast.error("Items Required", "Please add at least one item to the order")
      return
    }

    try {
      await createOrder({
        storeId,
        orderType,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: notes || undefined,
      })
      toast.success("Order created successfully!")
      router.push("/dashboard/orders")
    } catch (error: any) {
      toast.error("Failed to create order", error?.message || "Please try again")
    }
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)

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
              <h1 className="text-3xl font-bold text-gradient-gold mb-2">Create New Order</h1>
              <p className="text-foreground/60">Create a new order for a store</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Select the store for this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store">Store *</Label>
                    {storesLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        <span className="text-sm text-foreground/60">Loading stores...</span>
                      </div>
                    ) : (
                      <Select
                        id="store"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                      >
                        <option value="">Select a store</option>
                        {stores?.map((store: any) => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Order Type *</Label>
                    <Select
                      id="orderType"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as OrderType)}
                    >
                      <option value="MANUAL">Manual Order</option>
                      <option value="AUTO_REPLENISH">Auto Replenishment</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add products to this order</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderItemsEditor
                  items={orderItems}
                  onItemsChange={handleItemsChange}
                  readonly={false}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Any special instructions or notes for this order</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes or special instructions..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Store:</span>
                    <span className="font-medium">
                      {storeId
                        ? stores?.find((s: any) => s.id === storeId)?.name || "Not selected"
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Order Type:</span>
                    <span className="font-medium">
                      {orderType === "MANUAL" ? "Manual" : "Auto Replenishment"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Items:</span>
                    <span className="font-medium">{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Total Quantity:</span>
                    <span className="font-medium">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gold/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gradient-gold">Total Amount:</span>
                    <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !storeId || orderItems.length === 0}
                  className="w-full glow-gold-sm"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
