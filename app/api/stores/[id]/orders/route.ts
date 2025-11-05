import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { StoreService } from "@/lib/services/store.service"

// GET /api/stores/[id]/orders - Get store orders
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check if user can access this store
    if (!canAccessStore(user, params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
    }

    const orders = await StoreService.getStoreOrders(params.id, filters)

    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting store orders:", error)
    return NextResponse.json(
      { error: "Failed to get store orders" },
      { status: 500 }
    )
  }
}

