import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { TemperatureService } from "@/lib/services/temperature.service"

// GET /api/temperature/alerts - Get non-compliant temperature logs (alerts)
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

    const alerts = await TemperatureService.getNonCompliantLogs(filters)

    return NextResponse.json(alerts)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting temperature alerts:", error)
    return NextResponse.json(
      { error: "Failed to get temperature alerts" },
      { status: 500 }
    )
  }
}

