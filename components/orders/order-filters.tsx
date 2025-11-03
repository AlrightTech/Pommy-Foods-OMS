"use client"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import type { OrderStatus } from "@/types"

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  storeFilter: string
  onStoreFilterChange: (value: string) => void
  stores?: Array<{ id: string; name: string }>
  onReset?: () => void
}

export function OrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  storeFilter,
  onStoreFilterChange,
  stores = [],
  onReset,
}: OrderFiltersProps) {
  const statuses: OrderStatus[] = [
    "DRAFT",
    "PENDING",
    "APPROVED",
    "KITCHEN_PREP",
    "READY",
    "IN_DELIVERY",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl glass border border-gold/20">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="w-[180px]"
      >
        <option value="all">All Statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replace(/_/g, " ")}
          </option>
        ))}
      </Select>

      <Select
        value={storeFilter}
        onChange={(e) => onStoreFilterChange(e.target.value)}
        className="w-[200px]"
      >
        <option value="all">All Stores</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </Select>

      {onReset && (
        <Button variant="outline" onClick={onReset} size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  )
}

