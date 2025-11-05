"use client"

import { StoreLayout } from "@/components/layout/store-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useInvoices } from "@/hooks/use-invoices"
import { useCurrentUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function StoreInvoicesPage() {
  const { data: user } = useCurrentUser()
  const { data: invoices, loading: invoicesLoading } = useInvoices(
    user?.storeId ? { storeId: user.storeId } : undefined
  )
  const toast = useToast()

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        // Generate PDF from data using jsPDF
        const { downloadInvoicePDF } = await import("@/lib/utils/pdf-generator")
        downloadInvoicePDF(data)
        toast.success("Invoice PDF downloaded successfully")
      } else {
        const error = await response.json()
        toast.error("Failed to download invoice", error?.error || "Please try again")
      }
    } catch (error: any) {
      toast.error("Failed to download invoice", error?.message || "Please try again")
    }
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
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : invoices && invoices.length > 0 ? (
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
                  {invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber || invoice.id}
                      </TableCell>
                      <TableCell className="text-foreground/60">
                        {invoice.order?.orderNumber || invoice.orderId || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(invoice.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-foreground/60">
                        {invoice.dueDate ? format(new Date(invoice.dueDate), "PPP") : "N/A"}
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
                          {invoice.status || "PENDING"}
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
            ) : (
              <div className="text-center py-12 text-foreground/60">
                <p>No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  )
}
