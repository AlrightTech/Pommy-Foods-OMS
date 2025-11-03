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
import { Progress } from "@/components/ui/progress"
import { Search, Edit, Upload } from "lucide-react"
import { Select } from "@/components/ui/select"

interface StockItem {
  id: string
  productId: string
  productName: string
  productSku: string
  currentLevel: number
  threshold: number
  lastUpdated: Date
  isLowStock: boolean
}

interface StockTableProps {
  storeId?: string
  stockItems: StockItem[]
  onUpdate?: (itemId: string, newLevel: number) => void
  onBulkUpdate?: () => void
}

export function StockTable({
  storeId,
  stockItems,
  onUpdate,
  onBulkUpdate,
}: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const filteredItems = stockItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productSku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (item: StockItem) => {
    setEditingId(item.id)
    setEditValue(item.currentLevel)
  }

  const handleSave = (itemId: string) => {
    onUpdate?.(itemId, editValue)
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const getStockPercentage = (current: number, threshold: number) => {
    if (threshold === 0) return 100
    return Math.min((current / threshold) * 100, 100)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {onBulkUpdate && (
          <Button onClick={onBulkUpdate} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Update
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Level</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-foreground/60">
                  No stock items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isEditing = editingId === item.id
                const percentage = getStockPercentage(item.currentLevel, item.threshold)
                const isLow = item.currentLevel <= item.threshold

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-foreground/60">{item.productSku}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-24"
                          min={0}
                        />
                      ) : (
                        <span className="font-semibold">{item.currentLevel}</span>
                      )}
                    </TableCell>
                    <TableCell>{item.threshold}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[100px]">
                          <Progress value={percentage} />
                        </div>
                        <Badge variant={isLow ? "destructive" : "success"}>
                          {isLow ? "Low" : "OK"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSave(item.id)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

