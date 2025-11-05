"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { StoresTable } from "@/components/stores/stores-table"
import { StoreForm } from "@/components/stores/store-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useStores, useCreateStore, useUpdateStore } from "@/hooks/use-stores"
import { useToast } from "@/hooks/use-toast"

export default function StoresPage() {
  const { data: stores, loading: storesLoading, refetch: refetchStores } = useStores()
  const { mutate: createStore, loading: createLoading } = useCreateStore()
  const { mutate: updateStore, loading: updateLoading } = useUpdateStore("")
  const toast = useToast()
  
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
      try {
        const response = await fetch(`/api/stores/${storeId}`, {
          method: "DELETE",
          credentials: "include",
        })
        
        if (response.ok) {
          toast.success("Store deleted successfully")
          refetchStores()
        } else {
          const error = await response.json()
          toast.error("Failed to delete store", error?.error || "Please try again")
        }
      } catch (error: any) {
        toast.error("Failed to delete store", error?.message || "Please try again")
      }
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingStore) {
        const response = await fetch(`/api/stores/${editingStore.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          toast.success("Store updated successfully")
          setIsCreateDialogOpen(false)
          setEditingStore(null)
          refetchStores()
        } else {
          const error = await response.json()
          toast.error("Failed to update store", error?.error || "Please try again")
        }
      } else {
        await createStore(data)
        toast.success("Store created successfully")
        setIsCreateDialogOpen(false)
        setEditingStore(null)
        refetchStores()
      }
    } catch (error: any) {
      toast.error(
        editingStore ? "Failed to update store" : "Failed to create store",
        error?.message || "Please try again"
      )
    }
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
        {storesLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          </Card>
        ) : (
          <StoresTable
            stores={stores || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        )}

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
