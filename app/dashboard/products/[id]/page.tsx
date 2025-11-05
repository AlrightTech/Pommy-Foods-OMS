"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductForm } from "@/components/products/product-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Package, DollarSign, Calendar, Thermometer, Loader2 } from "lucide-react"
import { useProduct, useUpdateProduct } from "@/hooks/use-products"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { data: product, loading: productLoading, refetch: refetchProduct } = useProduct(productId)
  const { mutate: updateProduct, loading: updateLoading } = useUpdateProduct(productId)
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = async (data: any) => {
    try {
      await updateProduct(data)
      toast.success("Product updated successfully")
      setIsEditing(false)
      refetchProduct()
    } catch (error: any) {
      toast.error("Failed to update product", error?.message || "Please try again")
    }
  }

  if (productLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60 mb-4">Product not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
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
                <h1 className="text-3xl font-bold text-gradient-gold">{product.name}</h1>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-foreground/60">Product Details</p>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">SKU</p>
                  <p className="font-semibold text-lg">{product.sku}</p>
                </div>

                <div>
                  <p className="text-sm text-foreground/60 mb-1">Description</p>
                  <p className="text-foreground/80">{product.description || "No description"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl glass border border-gold/20">
                    <DollarSign className="w-6 h-6 text-gold mt-1" />
                    <div>
                      <p className="text-sm text-foreground/60">Price</p>
                      <p className="text-xl font-bold text-gradient-gold">
                        ${Number(product.price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-foreground/60">per {product.unit || "unit"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl glass border border-gold/20">
                    <Package className="w-6 h-6 text-gold mt-1" />
                    <div>
                      <p className="text-sm text-foreground/60">Category</p>
                      <p className="text-xl font-bold">{product.category || "N/A"}</p>
                    </div>
                  </div>

                  {product.shelfLife && (
                    <div className="flex items-start gap-3 p-4 rounded-xl glass border border-gold/20">
                      <Calendar className="w-6 h-6 text-gold mt-1" />
                      <div>
                        <p className="text-sm text-foreground/60">Shelf Life</p>
                        <p className="text-xl font-bold">{product.shelfLife} days</p>
                      </div>
                    </div>
                  )}

                  {(product.storageTempMin || product.storageTempMax) && (
                    <div className="flex items-start gap-3 p-4 rounded-xl glass border border-gold/20">
                      <Thermometer className="w-6 h-6 text-gold mt-1" />
                      <div>
                        <p className="text-sm text-foreground/60">Storage Temperature</p>
                        <p className="text-xl font-bold">
                          {product.storageTempMin || "N/A"}°C - {product.storageTempMax || "N/A"}°C
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60">Created</p>
                  <p className="font-semibold">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Status</p>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              defaultValues={{
                name: product.name,
                sku: product.sku,
                description: product.description || "",
                price: Number(product.price || 0),
                unit: product.unit || "unit",
                category: product.category || "",
                shelfLife: product.shelfLife || undefined,
                storageTempMin: product.storageTempMin || undefined,
                storageTempMax: product.storageTempMax || undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={updateLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
