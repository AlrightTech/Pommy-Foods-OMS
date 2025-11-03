import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole, canAccessStore } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"
import { z } from "zod"

const updateOrderItemsSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
})

// PUT /api/orders/[id]/items - Update order items
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Only admins can modify order items
    await requireRole(["SUPER_ADMIN", "ADMIN"])

    const order = await OrderService.getOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateOrderItemsSchema.parse(body)

    const updatedOrder = await OrderService.updateOrderItems(params.id, validatedData)

    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating order items:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order items" },
      { status: 500 }
    )
  }
}

