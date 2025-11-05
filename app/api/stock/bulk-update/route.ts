import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { StockService } from "@/lib/services/stock.service"
import { z } from "zod"

const bulkUpdateStockSchema = z.object({
  storeId: z.string(),
  updates: z.array(
    z.object({
      productId: z.string(),
      currentLevel: z.number().int().nonnegative(),
      threshold: z.number().int().positive().optional(),
    })
  ).min(1),
})

// POST /api/stock/bulk-update - Bulk update stock levels
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = bulkUpdateStockSchema.parse(body)

    // Check access to store
    if (!canAccessStore(user, validatedData.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const results = await StockService.bulkUpdateStock(validatedData, user.id)

    return NextResponse.json({ updated: results.length, results }, { status: 200 })
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

    console.error("Error bulk updating stock:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bulk update stock" },
      { status: 500 }
    )
  }
}

