"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsTable } from "@/components/products/products-table"
import { ProductForm } from "@/components/products/product-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Mock data - will be replaced with API calls
const mockProducts = [
  {
    id: "1",
    name: "Pommy Meal - Chicken",
    sku: "PM-CH-001",
    price: 12.99,
    category: "Meals",
    isActive: true,
  },
  {
    id: "2",
    name: "Pommy Meal - Beef",
    sku: "PM-BF-001",
    price: 14.99,
    category: "Meals",
    isActive: true,
  },
  {
    id: "3",
    name: "Pommy Meal - Vegetarian",
    sku: "PM-VEG-001",
    price: 11.99,
    category: "Meals",
    isActive: true,
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
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
      setProducts(products.filter((p) => p.id !== productId))
    }
  }

  const handleSubmit = async (data: any) => {
    // TODO: Replace with actual API call
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p))
      )
    } else {
      setProducts([...products, { ...data, id: Date.now().toString(), isActive: true }])
    }
    setIsCreateDialogOpen(false)
    setEditingProduct(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Products</h1>
            <p className="text-foreground/60">Manage your product catalog</p>
          </div>
          <Button onClick={handleCreate} className="glow-gold-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />

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
