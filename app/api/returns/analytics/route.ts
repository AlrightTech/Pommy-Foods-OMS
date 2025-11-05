import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"

// GET /api/returns/analytics - Get wastage analytics
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    }

    const analytics = await ReturnService.getWastageAnalytics(filters)

    return NextResponse.json(analytics)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting wastage analytics:", error)
    return NextResponse.json(
      { error: "Failed to get wastage analytics" },
      { status: 500 }
    )
  }
}

