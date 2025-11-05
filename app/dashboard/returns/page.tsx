"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select } from "@/components/ui/select"
import { Search, Eye, TrendingDown, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { useReturns } from "@/hooks/use-returns"

const statusConfig: Record<"PENDING" | "PROCESSED" | "REJECTED", { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "default" },
  PROCESSED: { label: "Processed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
}

export default function ReturnsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const { data: returns, loading: returnsLoading } = useReturns(
    statusFilter !== "all" ? { status: statusFilter as any } : undefined
  )

  const filteredReturns = useMemo(() => {
    if (!returns) return []
    
    return returns.filter((returnItem: any) => {
      const orderNumber = returnItem.delivery?.order?.orderNumber || ""
      const storeName = returnItem.delivery?.store?.name || ""
      const matchesSearch =
        orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        storeName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [returns, searchTerm, statusFilter])

  const totalWastage = useMemo(() => {
    if (!returns) return 0
    
    return returns
      .filter((r: any) => r.status === "PROCESSED")
      .reduce((sum: number, r: any) => {
        // Calculate total value from items
        const itemsValue = r.items?.reduce((itemSum: number, item: any) => {
          return itemSum + (Number(item.product?.price || 0) * item.quantity)
        }, 0) || 0
        return sum + itemsValue
      }, 0)
  }, [returns])

  // Format returns for table
  const formattedReturns = useMemo(() => {
    if (!returns) return []
    
    return returns.map((returnItem: any) => ({
      id: returnItem.id,
      deliveryId: returnItem.deliveryId,
      orderNumber: returnItem.delivery?.order?.orderNumber || "N/A",
      storeName: returnItem.delivery?.store?.name || "Unknown Store",
      returnDate: new Date(returnItem.createdAt),
      status: returnItem.status,
      totalQuantity: returnItem.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
      totalValue: returnItem.items?.reduce((sum: number, item: any) => {
        return sum + (Number(item.product?.price || 0) * item.quantity)
      }, 0) || 0,
    }))
  }, [returns])

  const stats = useMemo(() => {
    if (!returns) return { total: 0, pending: 0, processed: 0 }
    
    return {
      total: returns.length,
      pending: returns.filter((r: any) => r.status === "PENDING").length,
      processed: returns.filter((r: any) => r.status === "PROCESSED").length,
    }
  }, [returns])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Returns & Wastage</h1>
          <p className="text-foreground/60">Track returns and analyze wastage</p>
        </div>

        {/* Stats */}
        {returnsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Total Returns</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center text-yellow-600 glow-gold-sm">
                    <Package className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Total Wastage Value</p>
                    <p className="text-2xl font-bold text-red-600">${totalWastage.toFixed(2)}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center text-red-600 glow-gold-sm">
                    <TrendingDown className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Pending Processing</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center text-orange-600 glow-gold-sm">
                    <Package className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Returns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Returns History</CardTitle>
            <CardDescription>All returned items and wastage records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    placeholder="Search returns..."
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
                  <option value="PROCESSED">Processed</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </div>
            </div>

            {returnsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-foreground/60">
                        No returns found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((returnItem: any) => {
                      const status = statusConfig[returnItem.status as keyof typeof statusConfig]
                      return (
                        <TableRow key={returnItem.id}>
                          <TableCell className="font-medium">RET-{returnItem.id}</TableCell>
                          <TableCell>{returnItem.orderNumber}</TableCell>
                          <TableCell>{returnItem.storeName}</TableCell>
                          <TableCell className="text-foreground/60">
                            {returnItem.returnDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>{returnItem.totalQuantity} items</TableCell>
                          <TableCell className="font-semibold">
                            ${returnItem.totalValue.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/returns/${returnItem.id}`}>
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
            )}
          </CardContent>
        </Card>

        {/* Wastage Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Wastage Analytics</CardTitle>
            <CardDescription>Visual analysis of returns and wastage patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-foreground/40">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Wastage analytics chart will be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
