import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { StockService } from "@/lib/services/stock.service"
import { z } from "zod"

const updateStockSchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  currentLevel: z.number().int().nonnegative(),
  threshold: z.number().int().positive().optional(),
})

// GET /api/stock - List stock levels
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      productId: searchParams.get("productId") || undefined,
      lowStock: searchParams.get("lowStock") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
    }

    // Store owners/managers can only see their own store stock
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const stock = await StockService.listStock(filters)

    return NextResponse.json(stock)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing stock:", error)
    return NextResponse.json(
      { error: "Failed to list stock" },
      { status: 500 }
    )
  }
}

// POST /api/stock - Update stock level
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = updateStockSchema.parse(body)

    // Check access to store
    if (!canAccessStore(user, validatedData.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const stock = await StockService.updateStock(validatedData, user.id)

    return NextResponse.json(stock, { status: 201 })
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

    console.error("Error updating stock:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update stock" },
      { status: 500 }
    )
  }
}

