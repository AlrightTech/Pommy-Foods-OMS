"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KitchenSheetsList } from "@/components/kitchen/kitchen-sheets-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, Loader2 } from "lucide-react"

// Mock data
const mockKitchenSheets = [
  {
    id: "1",
    orderNumber: "ORD-001",
    status: "PENDING" as const,
    itemsCount: 5,
    createdAt: new Date("2024-01-15"),
    preparedBy: undefined,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    status: "IN_PROGRESS" as const,
    itemsCount: 8,
    createdAt: new Date("2024-01-15"),
    preparedBy: "Kitchen Staff A",
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    status: "COMPLETED" as const,
    itemsCount: 3,
    createdAt: new Date("2024-01-14"),
    preparedBy: "Kitchen Staff B",
    completedAt: new Date("2024-01-14"),
  },
]

export default function KitchenPage() {
  const pendingCount = mockKitchenSheets.filter((s) => s.status === "PENDING").length
  const inProgressCount = mockKitchenSheets.filter((s) => s.status === "IN_PROGRESS").length
  const completedCount = mockKitchenSheets.filter((s) => s.status === "COMPLETED").length

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Kitchen Sheets</h1>
          <p className="text-foreground/60">Manage kitchen preparation and packing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
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
                  <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-600 glow-gold-sm">
                  <Loader2 className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-600 glow-gold-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kitchen Sheets List */}
        <Card>
          <CardHeader>
            <CardTitle>All Kitchen Sheets</CardTitle>
            <CardDescription>View and manage all kitchen preparation sheets</CardDescription>
          </CardHeader>
          <CardContent>
            <KitchenSheetsList sheets={mockKitchenSheets} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
