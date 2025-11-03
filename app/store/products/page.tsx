"use client"

import { useState } from "react"
import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Plus, Minus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock products
const mockProducts = [
  {
    id: "1",
    name: "Pommy Meal - Chicken",
    sku: "PM-CH-001",
    description: "Delicious chicken meal",
    price: 12.99,
    availableStock: 100,
  },
  {
    id: "2",
    name: "Pommy Meal - Beef",
    sku: "PM-BF-001",
    description: "Tender beef meal",
    price: 14.99,
    availableStock: 80,
  },
  {
    id: "3",
    name: "Pommy Meal - Vegetarian",
    sku: "PM-VEG-001",
    description: "Healthy vegetarian option",
    price: 11.99,
    availableStock: 60,
  },
]

export default function StoreProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [showCart, setShowCart] = useState(false)

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
  }

  const updateCartQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      const newQuantity = (prev[productId] || 0) + change
      if (newQuantity <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQuantity }
    })
  }

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = mockProducts.find((p) => p.id === productId)
    return product ? { ...product, quantity } : null
  }).filter(Boolean) as Array<typeof mockProducts[0] & { quantity: number }>

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const handleCheckout = () => {
    // TODO: Create order API call
    alert("Order submitted! Admin will review and approve.")
    setCart({})
    setShowCart(false)
  }

  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Products & Ordering</h1>
            <p className="text-foreground/60">Browse products and place orders</p>
          </div>
          <Button onClick={() => setShowCart(true)} className="glow-gold-sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart ({Object.values(cart).reduce((a, b) => a + b, 0)})
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gradient-gold mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60">{product.sku}</p>
                    <p className="text-sm text-foreground/70 mt-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                    <div>
                      <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-foreground/60">
                        Stock: {product.availableStock}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cart[product.id] ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCartQuantity(product.id, -1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {cart[product.id]}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCartQuantity(product.id, 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => addToCart(product.id)}
                          size="sm"
                          className="glow-gold-sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shopping Cart</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-center py-8 text-foreground/60">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-foreground/60">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="w-20 text-right font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gold/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-gradient-gold">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full glow-gold-sm"
                      size="lg"
                    >
                      Submit Order
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StoreLayout>
  )
}

