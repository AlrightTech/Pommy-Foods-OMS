import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"
import { z } from "zod"

const generateBarcodeSchema = z.object({
  itemId: z.string(),
})

// POST /api/kitchen-sheets/generate-barcode - Generate barcode for item
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only kitchen staff or admins can generate barcodes
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "KITCHEN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = generateBarcodeSchema.parse(body)

    // Get item to generate barcode for
    const item = await KitchenService.updateKitchenSheetItem(
      "", // Will be determined from item
      validatedData.itemId,
      {}
    )

    // For now, return barcode data
    // In production, this would generate actual barcode image
    const barcode = `BC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    return NextResponse.json({ barcode, itemId: validatedData.itemId })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error generating barcode:", error)
    return NextResponse.json(
      { error: "Failed to generate barcode" },
      { status: 500 }
    )
  }
}

