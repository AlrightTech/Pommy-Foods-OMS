import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { KitchenService } from "@/lib/services/kitchen.service"
import { z } from "zod"

const packItemSchema = z.object({
  batchNumber: z.string().min(1),
  expiryDate: z.string().transform((str) => new Date(str)),
})

// POST /api/kitchen-sheets/[id]/items/[itemId]/pack - Mark item as packed with batch/expiry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await requireAuth()

    // Only kitchen staff or admins can pack items
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "KITCHEN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = packItemSchema.parse(body)

    const result = await KitchenService.markItemAsPacked(
      params.id,
      params.itemId,
      validatedData.batchNumber,
      validatedData.expiryDate,
      user.id
    )

    return NextResponse.json(result)
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

    console.error("Error packing item:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to pack item" },
      { status: 500 }
    )
  }
}

