import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { AnalyticsService } from "@/lib/services/analytics.service"

// GET /api/analytics/sales - Get sales reports
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      productId: searchParams.get("productId") || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      groupBy: (searchParams.get("groupBy") as "day" | "week" | "month" | "year") || undefined,
    }

    // Store owners/managers can only see their store's analytics
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores' analytics
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const report = await AnalyticsService.getSalesReport(filters)

    return NextResponse.json(report)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting sales report:", error)
    return NextResponse.json(
      { error: "Failed to get sales report" },
      { status: 500 }
    )
  }
}

