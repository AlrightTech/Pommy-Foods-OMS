import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole, canAccessStore } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"
import { z } from "zod"

const updateOrderSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "KITCHEN_PREP", "READY", "IN_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"]).optional(),
})

const updateOrderItemsSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
})

// GET /api/orders/[id] - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const order = await OrderService.getOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check access to store
    if (!canAccessStore(user, order.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting order:", error)
    return NextResponse.json(
      { error: "Failed to get order" },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const order = await OrderService.getOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check access
    if (!canAccessStore(user, order.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    // Only admins can change status directly (except for store owners submitting)
    if (validatedData.status && validatedData.status !== "PENDING") {
      if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const updatedOrder = await OrderService.updateOrder(params.id, validatedData)

    return NextResponse.json(updatedOrder)
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

    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 }
    )
  }
}

