import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"
import { z } from "zod"

const createOrderSchema = z.object({
  storeId: z.string(),
  orderType: z.enum(["MANUAL", "AUTO_REPLENISH"]),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  notes: z.string().optional(),
})

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      status: searchParams.get("status") as any || undefined,
      orderType: searchParams.get("orderType") as any || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      search: searchParams.get("search") || undefined,
    }

    // Store owners/managers can only see their own store's orders
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores' orders
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const orders = await OrderService.listOrders(filters)

    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing orders:", error)
    return NextResponse.json(
      { error: "Failed to list orders" },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Check access to store
    if (!canAccessStore(user, validatedData.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Store owners/managers can only create MANUAL orders
    if ((user.role === "STORE_OWNER" || user.role === "STORE_MANAGER") && validatedData.orderType !== "MANUAL") {
      return NextResponse.json(
        { error: "Store users can only create manual orders" },
        { status: 403 }
      )
    }

    const order = await OrderService.createOrder({
      ...validatedData,
      createdById: user.id,
    })

    return NextResponse.json(order, { status: 201 })
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

    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    )
  }
}

