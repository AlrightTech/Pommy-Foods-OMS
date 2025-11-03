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
import { Search, Eye, CheckCircle2 } from "lucide-react"
import { Select } from "@/components/ui/select"
import Link from "next/link"
import type { KitchenSheetStatus } from "@prisma/client"

interface KitchenSheet {
  id: string
  orderNumber: string
  status: KitchenSheetStatus
  itemsCount: number
  createdAt: Date
  preparedBy?: string
  completedAt?: Date
}

interface KitchenSheetsListProps {
  sheets: KitchenSheet[]
  onView?: (sheetId: string) => void
}

const statusConfig: Record<KitchenSheetStatus, { label: string; variant: "default" | "secondary" | "success" }> = {
  PENDING: { label: "Pending", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETED: { label: "Completed", variant: "success" },
}

export function KitchenSheetsList({ sheets, onView }: KitchenSheetsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredSheets = sheets.filter((sheet) => {
    const matchesSearch =
      sheet.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sheet.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search by order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[200px]"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Items Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Prepared By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-foreground/60">
                  No kitchen sheets found
                </TableCell>
              </TableRow>
            ) : (
              filteredSheets.map((sheet) => {
                const status = statusConfig[sheet.status]
                return (
                  <TableRow key={sheet.id}>
                    <TableCell className="font-medium">{sheet.orderNumber}</TableCell>
                    <TableCell>{sheet.itemsCount} items</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground/60">
                      {sheet.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-foreground/60">
                      {sheet.preparedBy || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/kitchen/${sheet.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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

