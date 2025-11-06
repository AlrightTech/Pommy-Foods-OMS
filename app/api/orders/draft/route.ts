import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"

export const dynamic = 'force-dynamic'

// GET /api/orders/draft - Get draft orders (auto-generated)
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId") || undefined

    const orders = await OrderService.getDraftOrders(storeId)

    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error getting draft orders:", error)
    return NextResponse.json(
      { error: "Failed to get draft orders" },
      { status: 500 }
    )
  }
}

