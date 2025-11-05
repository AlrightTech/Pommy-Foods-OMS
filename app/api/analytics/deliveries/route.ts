import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { AnalyticsService } from "@/lib/services/analytics.service"

// GET /api/analytics/deliveries - Get delivery performance metrics
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    
    const filters = {
      driverId: searchParams.get("driverId") || undefined,
      storeId: searchParams.get("storeId") || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    }

    // Drivers can only see their own metrics
    if (user.role === "DRIVER") {
      filters.driverId = user.id
    }

    // Store owners/managers can only see their store's metrics
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    const metrics = await AnalyticsService.getDeliveryMetrics(filters)

    return NextResponse.json(metrics)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting delivery metrics:", error)
    return NextResponse.json(
      { error: "Failed to get delivery metrics" },
      { status: 500 }
    )
  }
}

