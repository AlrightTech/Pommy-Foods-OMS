import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"

// POST /api/deliveries/[id]/start - Start delivery (driver action)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Only drivers can start deliveries
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const delivery = await DeliveryService.startDelivery(params.id, user.id)

    return NextResponse.json(delivery)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error starting delivery:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start delivery" },
      { status: 500 }
    )
  }
}

