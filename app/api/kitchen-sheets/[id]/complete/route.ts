import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"

// POST /api/kitchen-sheets/[id]/complete - Mark kitchen sheet as completed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Only kitchen staff or admins can complete sheets
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "KITCHEN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sheet = await KitchenService.updateKitchenSheetStatus(
      params.id,
      "COMPLETED",
      user.id
    )

    return NextResponse.json(sheet)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error completing kitchen sheet:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete kitchen sheet" },
      { status: 500 }
    )
  }
}

