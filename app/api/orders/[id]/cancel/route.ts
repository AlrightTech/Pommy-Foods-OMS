import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"

// POST /api/orders/[id]/cancel - Cancel order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const order = await OrderService.getOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check access - store owners can cancel their own orders, admins can cancel any
    if (!canAccessStore(user, order.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const cancelledOrder = await OrderService.cancelOrder(params.id)

    return NextResponse.json(cancelledOrder)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error cancelling order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel order" },
      { status: 500 }
    )
  }
}

