import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"

// POST /api/orders/[id]/approve - Approve order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ADMIN"])

    const order = await OrderService.approveOrder(params.id, user.id)

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error approving order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve order" },
      { status: 500 }
    )
  }
}

