"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import Link from "next/link"
import type { InvoiceStatus } from "@/types"

// Mock invoices
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    orderNumber: "ORD-001",
    totalAmount: 450.0,
    status: "PENDING" as InvoiceStatus,
    dueDate: new Date("2024-01-25"),
    issuedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    orderNumber: "ORD-002",
    totalAmount: 320.0,
    status: "PAID" as InvoiceStatus,
    dueDate: new Date("2024-01-20"),
    issuedAt: new Date("2024-01-10"),
    paidAt: new Date("2024-01-18"),
  },
]

export default function StoreInvoicesPage() {
  const handleDownload = (invoiceId: string) => {
    // TODO: Download invoice PDF
    alert(`Downloading invoice ${invoiceId}`)
  }

  return (
    <StoreLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Invoices & Payments</h1>
          <p className="text-foreground/60">View invoices and payment status</p>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>All invoices for this store</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-foreground/60">{invoice.orderNumber}</TableCell>
                    <TableCell className="font-semibold">
                      ${invoice.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-foreground/60">
                      {invoice.dueDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "PAID"
                            ? "success"
                            : invoice.status === "OVERDUE"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/store/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(invoice.id)}
                          className="h-8 w-8"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  )
}

