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
import { ArrowLeft, Save } from "lucide-react"

// Mock stores
const mockStores = [
  { id: "1", name: "Convenience Store A" },
  { id: "2", name: "Restaurant B" },
  { id: "3", name: "Convenience Store C" },
]

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
  const [storeId, setStoreId] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleItemsChange = (items: OrderItem[]) => {
    setOrderItems(items)
  }

  const handleSubmit = async () => {
    if (!storeId) {
      alert("Please select a store")
      return
    }

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order")
      return
    }

    setIsLoading(true)
    try {
      // TODO: API call to create order
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Order created successfully!")
      router.push("/dashboard/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order")
    } finally {
      setIsLoading(false)
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
                    <Select
                      id="store"
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                    >
                      <option value="">Select a store</option>
                      {mockStores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
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
                        ? mockStores.find((s) => s.id === storeId)?.name || "Not selected"
                        : "Not selected"}
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
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Creating Order..." : "Create Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

