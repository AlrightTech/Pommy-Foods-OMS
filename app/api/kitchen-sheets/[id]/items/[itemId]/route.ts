import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"
import { z } from "zod"

const updateItemSchema = z.object({
  batchNumber: z.string().optional(),
  expiryDate: z.string().transform((str) => new Date(str)).optional().or(z.undefined()),
  barcode: z.string().optional(),
  qrCode: z.string().optional(),
  isPacked: z.boolean().optional(),
})

// PUT /api/kitchen-sheets/[id]/items/[itemId] - Update kitchen sheet item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await requireAuth()

    // Only kitchen staff or admins can update items
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "KITCHEN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)

    const item = await KitchenService.updateKitchenSheetItem(
      params.id,
      params.itemId,
      validatedData
    )

    return NextResponse.json(item)
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

    console.error("Error updating kitchen sheet item:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update item" },
      { status: 500 }
    )
  }
}

