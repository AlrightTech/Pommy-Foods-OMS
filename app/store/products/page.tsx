"use client"

import { useState, useMemo } from "react"
import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Plus, Minus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProducts } from "@/hooks/use-products"
import { useCreateOrder } from "@/hooks/use-orders"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

export default function StoreProductsPage() {
  const { data: user } = useCurrentUser()
  const { data: products, loading: productsLoading } = useProducts()
  const { mutate: createOrder, loading: createLoading } = useCreateOrder()
  const toast = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [showCart, setShowCart] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(
      (product: any) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

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

  const cartItems = useMemo(() => {
    if (!products) return []
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((p: any) => p.id === productId)
        return product ? { ...product, quantity } : null
      })
      .filter(Boolean) as Array<any & { quantity: number }>
  }, [cart, products])

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (Number(item.price || 0) * item.quantity),
      0
    )
  }, [cartItems])

  const handleCheckout = async () => {
    if (!user?.storeId) {
      toast.error("Store Required", "Please ensure you are associated with a store")
      return
    }

    if (cartItems.length === 0) {
      toast.error("Cart Empty", "Please add items to your cart")
      return
    }

    try {
      await createOrder({
        storeId: user.storeId,
        orderType: "MANUAL",
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        notes: "Order placed from store portal",
      })
      toast.success("Order submitted successfully! Admin will review and approve.")
      setCart({})
      setShowCart(false)
    } catch (error: any) {
      toast.error("Failed to submit order", error?.message || "Please try again")
    }
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
        {productsLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-foreground/60">
                <p>No products found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gradient-gold mb-1">
                        {product.name || "Unknown Product"}
                      </h3>
                      <p className="text-sm text-foreground/60">{product.sku || "N/A"}</p>
                      <p className="text-sm text-foreground/70 mt-2">
                        {product.description || "No description available"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                      <div>
                        <p className="text-2xl font-bold">${Number(product.price || 0).toFixed(2)}</p>
                        <p className="text-xs text-foreground/60">
                          Stock: {product.stockLevel || "N/A"}
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
        )}

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
                          <p className="font-semibold">{item.name || "Unknown Product"}</p>
                          <p className="text-sm text-foreground/60">
                            ${Number(item.price || 0).toFixed(2)} each
                          </p>
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
                            ${(Number(item.price || 0) * item.quantity).toFixed(2)}
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
                      disabled={createLoading}
                      className="w-full glow-gold-sm"
                      size="lg"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Order"
                      )}
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
