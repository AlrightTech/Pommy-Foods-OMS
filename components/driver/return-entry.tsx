"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface ReturnItem {
  productId: string
  productName: string
  quantity: number
  expiryDate: string
  reason: string
}

interface ReturnEntryProps {
  products: Array<{ id: string; name: string; sku: string }>
  onSubmit: (items: ReturnItem[]) => Promise<void>
}

export function ReturnEntry({ products, onSubmit }: ReturnEntryProps) {
  const [items, setItems] = useState<ReturnItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [reason, setReason] = useState("expired")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || !expiryDate) {
      alert("Please fill in all required fields")
      return
    }

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    setItems([
      ...items,
      {
        productId: selectedProduct,
        productName: product.name,
        quantity: parseInt(quantity),
        expiryDate,
        reason,
      },
    ])

    // Reset form
    setSelectedProduct("")
    setQuantity("")
    setExpiryDate("")
    setReason("expired")
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Please add at least one return item")
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(items)
      setItems([])
      alert("Returns submitted successfully!")
    } catch (error) {
      console.error("Return submission error:", error)
      alert("Failed to submit returns")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Log Returns</h3>
          <p className="text-sm text-foreground/60">
            Enter expired unsold items to be returned
          </p>

          {/* Add Item Form */}
          <div className="p-4 rounded-xl glass border border-gold/20 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Qty"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="expired">Expired</option>
                <option value="damaged">Damaged</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <Button onClick={handleAddItem} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Return Items ({items.length})</h4>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl glass border border-gold/20"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-foreground/60">
                      Qty: {item.quantity} • Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="h-8 w-8 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || items.length === 0}
            className="w-full glow-gold-sm"
          >
            {isLoading ? "Submitting..." : `Submit ${items.length} Return Item${items.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

