import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { StoreService } from "@/lib/services/store.service"

// GET /api/stores/[id]/stock - Get store stock levels
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

    const stock = await StoreService.getStoreStock(params.id)

    return NextResponse.json(stock)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting store stock:", error)
    return NextResponse.json(
      { error: "Failed to get store stock" },
      { status: 500 }
    )
  }
}

