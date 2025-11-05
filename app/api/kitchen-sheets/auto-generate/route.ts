import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"

// POST /api/kitchen-sheets/auto-generate - Auto-generate kitchen sheets for approved orders
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "KITCHEN_STAFF"], request)

    const result = await KitchenService.autoGenerateKitchenSheets()

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error auto-generating kitchen sheets:", error)
    return NextResponse.json(
      { error: "Failed to auto-generate kitchen sheets" },
      { status: 500 }
    )
  }
}

