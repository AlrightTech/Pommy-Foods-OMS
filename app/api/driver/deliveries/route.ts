import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"

// GET /api/driver/deliveries - Get deliveries for current driver
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only drivers can access this endpoint
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.get("status") as any || undefined,
      date: searchParams.get("date") 
        ? new Date(searchParams.get("date")!) 
        : undefined,
    }

    const deliveries = await DeliveryService.getDriverDeliveries(user.id, filters)

    return NextResponse.json(deliveries)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting driver deliveries:", error)
    return NextResponse.json(
      { error: "Failed to get driver deliveries" },
      { status: 500 }
    )
  }
}

