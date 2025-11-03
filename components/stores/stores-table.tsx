"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Select } from "@/components/ui/select"
import Link from "next/link"

interface Store {
  id: string
  name: string
  contactName: string
  email?: string
  phone: string
  city: string
  region: string
  isActive: boolean
}

interface StoresTableProps {
  stores: Store[]
  onEdit?: (store: Store) => void
  onDelete?: (storeId: string) => void
  onCreate?: () => void
}

export function StoresTable({
  stores,
  onEdit,
  onDelete,
  onCreate,
}: StoresTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [regionFilter, setRegionFilter] = useState("all")

  const regions = Array.from(new Set(stores.map((s) => s.region)))

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = regionFilter === "all" || store.region === regionFilter
    return matchesSearch && matchesRegion
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-[200px]"
          >
            <option value="all">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={onCreate} className="glow-gold-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-foreground/60">
                  No stores found
                </TableCell>
              </TableRow>
            ) : (
              filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>{store.contactName}</TableCell>
                  <TableCell className="text-foreground/60">
                    {store.city}, {store.region}
                  </TableCell>
                  <TableCell className="text-foreground/60">{store.phone}</TableCell>
                  <TableCell>
                    <Badge variant={store.isActive ? "default" : "secondary"}>
                      {store.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/stores/${store.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(store)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(store.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

