import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"

// GET /api/kitchen-sheets - List kitchen sheets
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get("status") as any || undefined,
      orderId: searchParams.get("orderId") || undefined,
      preparedBy: searchParams.get("preparedBy") || undefined,
    }

    const sheets = await KitchenService.listKitchenSheets(filters)

    return NextResponse.json(sheets)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing kitchen sheets:", error)
    return NextResponse.json(
      { error: "Failed to list kitchen sheets" },
      { status: 500 }
    )
  }
}

// POST /api/kitchen-sheets - Generate kitchen sheet from order
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admins or kitchen staff can generate sheets
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "KITCHEN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const sheet = await KitchenService.generateKitchenSheet(orderId)

    return NextResponse.json(sheet, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error generating kitchen sheet:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate kitchen sheet" },
      { status: 500 }
    )
  }
}

