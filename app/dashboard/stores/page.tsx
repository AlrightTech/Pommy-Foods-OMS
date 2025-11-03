"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { StoresTable } from "@/components/stores/stores-table"
import { StoreForm } from "@/components/stores/store-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data
const mockStores = [
  {
    id: "1",
    name: "Convenience Store A",
    contactName: "John Doe",
    email: "john@storea.com",
    phone: "+1 234-567-8900",
    city: "New York",
    region: "NYC",
    isActive: true,
  },
  {
    id: "2",
    name: "Restaurant B",
    contactName: "Jane Smith",
    email: "jane@restb.com",
    phone: "+1 234-567-8901",
    city: "Los Angeles",
    region: "California",
    isActive: true,
  },
  {
    id: "3",
    name: "Convenience Store C",
    contactName: "Bob Johnson",
    email: "bob@storec.com",
    phone: "+1 234-567-8902",
    city: "Chicago",
    region: "Illinois",
    isActive: true,
  },
]

export default function StoresPage() {
  const [stores, setStores] = useState(mockStores)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)

  const handleCreate = () => {
    setEditingStore(null)
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (store: any) => {
    setEditingStore(store)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (storeId: string) => {
    if (confirm("Are you sure you want to delete this store?")) {
      setStores(stores.filter((s) => s.id !== storeId))
    }
  }

  const handleSubmit = async (data: any) => {
    // TODO: Replace with actual API call
    if (editingStore) {
      setStores(
        stores.map((s) => (s.id === editingStore.id ? { ...s, ...data } : s))
      )
    } else {
      setStores([...stores, { ...data, id: Date.now().toString(), isActive: true }])
    }
    setIsCreateDialogOpen(false)
    setEditingStore(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Stores</h1>
          <p className="text-foreground/60">Manage store accounts and customers</p>
        </div>

        {/* Stores Table */}
        <StoresTable
          stores={stores}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStore ? "Edit Store" : "Create New Store"}</DialogTitle>
            </DialogHeader>
            <StoreForm
              defaultValues={editingStore}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsCreateDialogOpen(false)
                setEditingStore(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
