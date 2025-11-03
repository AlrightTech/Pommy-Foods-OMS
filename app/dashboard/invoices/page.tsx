"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InvoicesTable } from "@/components/invoices/invoices-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import type { InvoiceStatus } from "@/types"

// Mock data
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    orderNumber: "ORD-001",
    storeName: "Convenience Store A",
    totalAmount: 450.0,
    status: "PENDING" as InvoiceStatus,
    dueDate: new Date("2024-01-25"),
    issuedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    orderNumber: "ORD-002",
    storeName: "Restaurant B",
    totalAmount: 1250.0,
    status: "PARTIAL" as InvoiceStatus,
    dueDate: new Date("2024-01-20"),
    issuedAt: new Date("2024-01-10"),
    paidAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    orderNumber: "ORD-003",
    storeName: "Convenience Store C",
    totalAmount: 320.0,
    status: "OVERDUE" as InvoiceStatus,
    dueDate: new Date("2024-01-10"),
    issuedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    invoiceNumber: "INV-004",
    orderNumber: "ORD-004",
    storeName: "Restaurant D",
    totalAmount: 890.0,
    status: "PAID" as InvoiceStatus,
    dueDate: new Date("2024-01-15"),
    issuedAt: new Date("2024-01-05"),
    paidAt: new Date("2024-01-14"),
  },
]

export default function InvoicesPage() {
  const handleDownload = (invoiceId: string) => {
    // TODO: Generate and download PDF
    alert(`Downloading invoice ${invoiceId}`)
  }

  const stats = {
    total: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    pending: mockInvoices.filter((inv) => inv.status === "PENDING").length,
    overdue: mockInvoices.filter((inv) => inv.status === "OVERDUE").length,
    paid: mockInvoices.filter((inv) => inv.status === "PAID").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Invoices & Payments</h1>
          <p className="text-foreground/60">Manage invoices and payment tracking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${stats.total.toFixed(2)}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center text-gold glow-gold-sm">
                  <DollarSign className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center text-yellow-600 glow-gold-sm">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center text-red-600 glow-gold-sm">
                  <AlertCircle className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 glow-gold-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>View and manage all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoicesTable invoices={mockInvoices} onDownload={handleDownload} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
