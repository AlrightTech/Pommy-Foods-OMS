import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"

// GET /api/deliveries/[id]/returns - Get returns for a specific delivery
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const returns = await ReturnService.listReturns({
      deliveryId: params.id,
    })

    // Check if user can access this delivery's returns
    if (returns.length > 0) {
      const { DeliveryService } = await import("@/lib/services/delivery.service")
      const delivery = await DeliveryService.getDeliveryById(params.id)
      
      if (!delivery) {
        return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
      }

      // Drivers can only see their own delivery returns
      if (user.role === "DRIVER" && delivery.driverId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json(returns)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting delivery returns:", error)
    return NextResponse.json(
      { error: "Failed to get delivery returns" },
      { status: 500 }
    )
  }
}

