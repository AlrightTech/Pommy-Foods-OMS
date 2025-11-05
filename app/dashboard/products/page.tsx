"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsTable } from "@/components/products/products-table"
import { ProductForm } from "@/components/products/product-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useProducts, useCreateProduct } from "@/hooks/use-products"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const { data: products, loading: productsLoading, refetch: refetchProducts } = useProducts()
  const { mutate: createProduct, loading: createLoading } = useCreateProduct()
  const toast = useToast()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const handleCreate = () => {
    setEditingProduct(null)
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
          credentials: "include",
        })
        
        if (response.ok) {
          toast.success("Product deleted successfully")
          refetchProducts()
        } else {
          const error = await response.json()
          toast.error("Failed to delete product", error?.error || "Please try again")
        }
      } catch (error: any) {
        toast.error("Failed to delete product", error?.message || "Please try again")
      }
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          toast.success("Product updated successfully")
          setIsCreateDialogOpen(false)
          setEditingProduct(null)
          refetchProducts()
        } else {
          const error = await response.json()
          toast.error("Failed to update product", error?.error || "Please try again")
        }
      } else {
        await createProduct(data)
        toast.success("Product created successfully")
        setIsCreateDialogOpen(false)
        setEditingProduct(null)
        refetchProducts()
      }
    } catch (error: any) {
      toast.error(
        editingProduct ? "Failed to update product" : "Failed to create product",
        error?.message || "Please try again"
      )
    }
  }

  // Convert products to the format expected by ProductsTable
  const formattedProducts = products?.map((product: any) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    category: product.category || "",
    isActive: product.isActive,
  })) || []

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Products</h1>
            <p className="text-foreground/60">Manage your product catalog</p>
          </div>
          <Button onClick={handleCreate} className="glow-gold-sm" disabled={createLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        {productsLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProductsTable
            products={formattedProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              defaultValues={editingProduct}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsCreateDialogOpen(false)
                setEditingProduct(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
