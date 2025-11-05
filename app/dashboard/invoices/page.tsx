"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InvoicesTable } from "@/components/invoices/invoices-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { useInvoices } from "@/hooks/use-invoices"
import { useToast } from "@/hooks/use-toast"

export default function InvoicesPage() {
  const { data: invoices, loading: invoicesLoading } = useInvoices()
  const toast = useToast()

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        // TODO: Generate PDF from data in frontend using jsPDF
        toast.info("PDF download will be implemented soon")
      } else {
        const error = await response.json()
        toast.error("Failed to download invoice", error?.error || "Please try again")
      }
    } catch (error: any) {
      toast.error("Failed to download invoice", error?.message || "Please try again")
    }
  }

  const stats = useMemo(() => {
    if (!invoices) return { total: 0, pending: 0, overdue: 0, paid: 0 }
    
    return {
      total: invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0),
      pending: invoices.filter((inv) => inv.status === "PENDING").length,
      overdue: invoices.filter((inv) => inv.status === "OVERDUE").length,
      paid: invoices.filter((inv) => inv.status === "PAID").length,
    }
  }, [invoices])

  // Format invoices for table
  const formattedInvoices = useMemo(() => {
    if (!invoices) return []
    
    return invoices.map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || invoice.id,
      orderNumber: invoice.order?.orderNumber || "N/A",
      storeName: invoice.store?.name || "Unknown Store",
      totalAmount: Number(invoice.totalAmount || 0),
      status: invoice.status,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      issuedAt: new Date(invoice.issuedAt || invoice.createdAt),
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
    }))
  }, [invoices])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Invoices & Payments</h1>
          <p className="text-foreground/60">Manage invoices and payment tracking</p>
        </div>

        {/* Stats */}
        {invoicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin text-gold" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
        )}

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>View and manage all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
              <InvoicesTable invoices={formattedInvoices} onDownload={handleDownload} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
