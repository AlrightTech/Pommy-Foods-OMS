"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KitchenSheetsList } from "@/components/kitchen/kitchen-sheets-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle2, Loader2 as LoaderIcon } from "lucide-react"
import { useKitchenSheets } from "@/hooks/use-kitchen"
import { Loader2 } from "lucide-react"

export default function KitchenPage() {
  const { data: sheets, loading } = useKitchenSheets()

  const stats = useMemo(() => {
    if (!sheets) return { pending: 0, inProgress: 0, completed: 0 }
    
    return {
      pending: sheets.filter((s: any) => s.status === "PENDING").length,
      inProgress: sheets.filter((s: any) => s.status === "IN_PROGRESS").length,
      completed: sheets.filter((s: any) => s.status === "COMPLETED").length,
    }
  }, [sheets])

  // Format sheets for the list component
  const formattedSheets = useMemo(() => {
    if (!sheets) return []
    
    return sheets.map((sheet: any) => ({
      id: sheet.id,
      orderNumber: sheet.order?.orderNumber || sheet.orderNumber || "N/A",
      status: sheet.status,
      itemsCount: sheet.items?.length || 0,
      createdAt: new Date(sheet.createdAt),
      preparedBy: sheet.preparedBy || undefined,
      completedAt: sheet.completedAt ? new Date(sheet.completedAt) : undefined,
    }))
  }, [sheets])

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Kitchen Sheets</h1>
          <p className="text-foreground/60">Manage kitchen preparation and packing</p>
        </div>

        {/* Stats */}
        {loading ? (
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
                    <p className="text-sm font-medium text-foreground/60 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
                    <LoaderIcon className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/60 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 glow-gold-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Kitchen Sheets List */}
        <Card>
          <CardHeader>
            <CardTitle>All Kitchen Sheets</CardTitle>
            <CardDescription>View and manage all kitchen preparation sheets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : (
              <KitchenSheetsList sheets={formattedSheets} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
