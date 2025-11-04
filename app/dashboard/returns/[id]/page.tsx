"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Calendar, Building, CheckCircle2, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock return data
const mockReturn = {
  id: "1",
  returnNumber: "RET-001",
  deliveryId: "DEL-001",
  orderNumber: "ORD-001",
  storeName: "Convenience Store A",
  returnDate: new Date("2024-01-15"),
  status: "PENDING" as "PENDING" | "PROCESSED" | "REJECTED",
  items: [
    {
      productName: "Pommy Meal - Chicken",
      quantity: 3,
      expiryDate: new Date("2024-01-10"),
      reason: "expired",
    },
    {
      productName: "Pommy Meal - Beef",
      quantity: 2,
      expiryDate: new Date("2024-01-12"),
      reason: "expired",
    },
  ],
  totalValue: 64.95,
}

export default function ReturnDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [returnItem, setReturnItem] = useState<typeof mockReturn & { status: "PENDING" | "PROCESSED" | "REJECTED" }>(mockReturn as typeof mockReturn & { status: "PENDING" | "PROCESSED" | "REJECTED" })

  const handleProcess = () => {
    setReturnItem({ ...returnItem, status: "PROCESSED" as "PROCESSED" })
    // TODO: API call to process return
    alert("Return processed successfully! Invoice will be adjusted.")
  }

  const handleReject = () => {
    if (!confirm("Are you sure you want to reject this return?")) return
    setReturnItem({ ...returnItem, status: "REJECTED" as "REJECTED" })
    // TODO: API call to reject return
    alert("Return rejected.")
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
                  {returnItem.returnNumber}
                </h1>
                <Badge
                  variant={
                    returnItem.status === "PROCESSED"
                      ? "success"
                      : returnItem.status === "REJECTED"
                      ? "destructive"
                      : "default"
                  }
                >
                  {returnItem.status}
                </Badge>
              </div>
              <p className="text-foreground/60">Return Details</p>
            </div>
          </div>
          {returnItem.status === "PENDING" && (
            <div className="flex gap-2">
              <Button onClick={handleReject} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleProcess} className="glow-gold-sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Process Return
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return Items */}
            <Card>
              <CardHeader>
                <CardTitle>Return Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItem.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-foreground/60">
                          {item.expiryDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {item.reason}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(item.quantity * 12.99).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Return Info */}
            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Store</p>
                    <p className="font-semibold">{returnItem.storeName}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Order Number</p>
                    <p className="font-semibold">{returnItem.orderNumber}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Delivery ID</p>
                    <p className="font-semibold">{returnItem.deliveryId}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Return Date</p>
                    <p className="font-semibold">
                      {returnItem.returnDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Return Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Total Items:</span>
                  <span className="font-medium">
                    {returnItem.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gradient-gold">Total Value:</span>
                  <span className="text-2xl font-bold">${returnItem.totalValue.toFixed(2)}</span>
                </div>
                {returnItem.status === "PROCESSED" && (
                  <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Invoice adjusted automatically
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

