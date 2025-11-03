"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Minus } from "lucide-react"
import { ProductSelector } from "@/components/products/product-selector"

interface OrderItem {
  id?: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderItemsEditorProps {
  items: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
  readonly?: boolean
}

export function OrderItemsEditor({
  items,
  onItemsChange,
  readonly = false,
}: OrderItemsEditorProps) {
  const [showProductSelector, setShowProductSelector] = useState(false)

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const updatedItems = [...items]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice
    onItemsChange(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    onItemsChange(updatedItems)
  }

  const handleAddProduct = (product: { id: string; name: string; sku: string; price: number }) => {
    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
    }
    onItemsChange([...items, newItem])
    setShowProductSelector(false)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gradient-gold">Order Items</h3>
        {!readonly && (
          <Button
            onClick={() => setShowProductSelector(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-foreground/60 rounded-xl glass border border-gold/20">
          No items in this order. Add products to continue.
        </div>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  {!readonly && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-foreground/60">{item.productSku}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {readonly ? (
                        <span className="font-medium">{item.quantity}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(index, parseInt(e.target.value) || 1)
                            }
                            className="w-20 text-center"
                            min={1}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${item.totalPrice.toFixed(2)}
                    </TableCell>
                    {!readonly && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-end">
            <div className="rounded-xl glass border border-gold/20 p-4 min-w-[250px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-foreground/60">Subtotal:</span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gold/20">
                <span className="text-lg font-semibold text-gradient-gold">Total:</span>
                <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {showProductSelector && (
        <ProductSelector
          onSelect={handleAddProduct}
          onClose={() => setShowProductSelector(false)}
        />
      )}
    </div>
  )
}

import { Card } from "@/components/ui/card"

