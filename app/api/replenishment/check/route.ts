import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { ReplenishmentService } from "@/lib/services/replenishment.service"

// POST /api/replenishment/check - Check stock and generate draft orders
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"])

    const body = await request.json().catch(() => ({}))
    const storeId = body.storeId || undefined

    const result = await ReplenishmentService.checkAndGenerateDraftOrders(storeId)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error checking replenishment:", error)
    return NextResponse.json(
      { error: "Failed to check replenishment" },
      { status: 500 }
    )
  }
}

