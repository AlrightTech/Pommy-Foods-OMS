import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { ReplenishmentService } from "@/lib/services/replenishment.service"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const updateThresholdSchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  threshold: z.number().int().positive(),
})

// GET /api/replenishment/rules - Get replenishment rules
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId") || undefined
    const productId = searchParams.get("productId") || undefined

    // Store owners/managers can only see their own store's rules
    if (storeId && !canAccessStore(user, storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const effectiveStoreId = (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER") && user.storeId
      ? user.storeId
      : storeId

    const rules = await ReplenishmentService.getReplenishmentRules(effectiveStoreId, productId)

    return NextResponse.json(rules)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting replenishment rules:", error)
    return NextResponse.json(
      { error: "Failed to get replenishment rules" },
      { status: 500 }
    )
  }
}

// PUT /api/replenishment/rules - Update threshold
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = updateThresholdSchema.parse(body)

    // Check access to store
    if (!canAccessStore(user, validatedData.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await ReplenishmentService.updateThreshold(
      validatedData.storeId,
      validatedData.productId,
      validatedData.threshold
    )

    return NextResponse.json(updated)
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

    console.error("Error updating threshold:", error)
    return NextResponse.json(
      { error: "Failed to update threshold" },
      { status: 500 }
    )
  }
}

