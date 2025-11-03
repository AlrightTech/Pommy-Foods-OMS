import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"

// GET /api/kitchen-sheets/[id] - Get kitchen sheet by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const sheet = await KitchenService.getKitchenSheetById(params.id)

    if (!sheet) {
      return NextResponse.json({ error: "Kitchen sheet not found" }, { status: 404 })
    }

    return NextResponse.json(sheet)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting kitchen sheet:", error)
    return NextResponse.json(
      { error: "Failed to get kitchen sheet" },
      { status: 500 }
    )
  }
}

