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
import { Select } from "@/components/ui/select"
import { Search, Eye, Download, DollarSign } from "lucide-react"
import Link from "next/link"
import type { InvoiceStatus } from "@/types"

interface Invoice {
  id: string
  invoiceNumber: string
  orderNumber: string
  storeName: string
  totalAmount: number
  status: InvoiceStatus
  dueDate: Date
  issuedAt: Date
  paidAt?: Date
}

interface InvoicesTableProps {
  invoices: Invoice[]
  onDownload?: (invoiceId: string) => void
}

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "default" },
  PARTIAL: { label: "Partial", variant: "secondary" },
  PAID: { label: "Paid", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
}

export function InvoicesTable({ invoices, onDownload }: InvoicesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate && statusFilter === "all"
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search invoices..."
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
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-foreground/60">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status]
                const overdue = isOverdue(invoice.dueDate) && invoice.status !== "PAID"

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-foreground/60">{invoice.orderNumber}</TableCell>
                    <TableCell>{invoice.storeName}</TableCell>
                    <TableCell className="font-semibold">
                      ${invoice.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={overdue ? "text-red-600 font-medium" : "text-foreground/60"}>
                        {invoice.dueDate.toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={overdue ? "destructive" : status.variant}>
                        {overdue ? "Overdue" : status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDownload?.(invoice.id)}
                          className="h-8 w-8"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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

