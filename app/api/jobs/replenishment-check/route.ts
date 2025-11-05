import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { checkAndGenerateDraftOrders } from "@/lib/jobs/replenishment-check"

// POST /api/jobs/replenishment-check - Trigger replenishment check manually
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const body = await request.json().catch(() => ({}))
    const storeId = body.storeId || undefined

    const result = await checkAndGenerateDraftOrders(storeId)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error running replenishment check:", error)
    return NextResponse.json(
      { error: "Failed to run replenishment check" },
      { status: 500 }
    )
  }
}

