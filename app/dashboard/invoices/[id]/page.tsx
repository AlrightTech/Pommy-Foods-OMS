"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentEntry } from "@/components/invoices/payment-entry"
import { ArrowLeft, Download, FileText, Building, Calendar, DollarSign } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { InvoiceStatus, PaymentMethod } from "@/types"

// Mock invoice data
const mockInvoice = {
  id: "1",
  invoiceNumber: "INV-001",
  orderNumber: "ORD-001",
  storeName: "Convenience Store A",
  subtotal: 450.0,
  discount: 0,
  tax: 45.0,
  returnAdjustment: 0,
  totalAmount: 495.0,
  status: "PENDING" as InvoiceStatus,
  dueDate: new Date("2024-01-25"),
  issuedAt: new Date("2024-01-15"),
  payments: [
    {
      id: "1",
      amount: 200.0,
      method: "CASH" as PaymentMethod,
      paymentDate: new Date("2024-01-16"),
    },
  ],
  items: [
    {
      productName: "Pommy Meal - Chicken",
      quantity: 20,
      unitPrice: 12.99,
      totalPrice: 259.8,
    },
    {
      productName: "Pommy Meal - Beef",
      quantity: 15,
      unitPrice: 14.99,
      totalPrice: 224.85,
    },
  ],
}

export default function InvoiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice] = useState(mockInvoice)

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingAmount = invoice.totalAmount - totalPaid

  const handlePayment = async (payment: {
    amount: number
    method: PaymentMethod
    transactionId?: string
    receiptUrl?: string
    notes?: string
  }) => {
    // TODO: API call to record payment
    alert(`Payment of $${payment.amount} recorded successfully!`)
  }

  const handleDownload = () => {
    // TODO: Generate and download PDF
    alert(`Downloading invoice ${invoice.invoiceNumber}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gradient-gold">
                  {invoice.invoiceNumber}
                </h1>
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
              </div>
              <p className="text-foreground/60">Invoice Details</p>
            </div>
          </div>
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${item.totalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoice.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-xl glass border border-gold/20"
                      >
                        <div>
                          <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-foreground/60">
                            {payment.method.replace("_", " ")} •{" "}
                            {payment.paymentDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="success">Paid</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Order Number</p>
                    <p className="font-semibold">{invoice.orderNumber}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Store</p>
                    <p className="font-semibold">{invoice.storeName}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Issued Date</p>
                    <p className="font-semibold">
                      {invoice.issuedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Due Date</p>
                    <p className="font-semibold">
                      {invoice.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Discount:</span>
                    <span className="font-medium">-${invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Tax:</span>
                    <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {invoice.returnAdjustment > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Return Adjustment:</span>
                    <span className="font-medium text-green-600">
                      -${invoice.returnAdjustment.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gradient-gold">Total:</span>
                  <span className="text-2xl font-bold">${invoice.totalAmount.toFixed(2)}</span>
                </div>
                {totalPaid > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Total Paid:</span>
                      <span className="font-medium text-green-600">
                        ${totalPaid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-gradient-gold">Remaining:</span>
                      <span className="text-xl font-bold">
                        ${remainingAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Entry */}
            {remainingAmount > 0 && invoice.status !== "PAID" && (
              <Card>
                <CardHeader>
                  <CardTitle>Record Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentEntry
                    invoiceId={invoice.id}
                    invoiceAmount={invoice.totalAmount}
                    remainingAmount={remainingAmount}
                    onPayment={handlePayment}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

