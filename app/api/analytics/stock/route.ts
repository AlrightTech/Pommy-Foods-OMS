import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { AnalyticsService } from "@/lib/services/analytics.service"

export const dynamic = 'force-dynamic'

// GET /api/analytics/stock - Get stock insights
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      productId: searchParams.get("productId") || undefined,
      lowStockOnly: searchParams.get("lowStockOnly") === "true",
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

    const insights = await AnalyticsService.getStockInsights(filters)

    return NextResponse.json(insights)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting stock insights:", error)
    return NextResponse.json(
      { error: "Failed to get stock insights" },
      { status: 500 }
    )
  }
}

