import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { TemperatureService } from "@/lib/services/temperature.service"

export const dynamic = 'force-dynamic'

// GET /api/temperature/compliance - Get compliance statistics
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
      location: searchParams.get("location") || undefined,
    }

    const statistics = await TemperatureService.getComplianceStatistics(filters)

    return NextResponse.json(statistics)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting compliance statistics:", error)
    return NextResponse.json(
      { error: "Failed to get compliance statistics" },
      { status: 500 }
    )
  }
}

