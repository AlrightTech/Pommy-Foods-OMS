import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"
import { z } from "zod"

const createReturnSchema = z.object({
  deliveryId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      expiryDate: z.string().transform((str) => new Date(str)),
      reason: z.string().default("expired"),
    })
  ).min(1),
  notes: z.string().optional(),
})

// GET /api/returns - List returns
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      deliveryId: searchParams.get("deliveryId") || undefined,
      status: searchParams.get("status") as any || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    }

    // Store owners/managers can only see their store's returns
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores' returns
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const returns = await ReturnService.listReturns(filters)

    return NextResponse.json(returns)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing returns:", error)
    return NextResponse.json(
      { error: "Failed to list returns" },
      { status: 500 }
    )
  }
}

// POST /api/returns - Create return
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Only drivers can create returns
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createReturnSchema.parse(body)

    const returnRecord = await ReturnService.createReturn({
      ...validatedData,
      returnedBy: user.id,
    })

    return NextResponse.json(returnRecord, { status: 201 })
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

    console.error("Error creating return:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create return" },
      { status: 500 }
    )
  }
}

