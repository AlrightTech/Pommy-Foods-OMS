import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { OrderService } from "@/lib/services/order.service"
import { z } from "zod"

const rejectOrderSchema = z.object({
  notes: z.string().optional(),
})

// POST /api/orders/[id]/reject - Reject order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const body = await request.json().catch(() => ({}))
    const validatedData = rejectOrderSchema.parse(body)

    const order = await OrderService.rejectOrder(params.id, validatedData.notes)

    return NextResponse.json(order)
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

    console.error("Error rejecting order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reject order" },
      { status: 500 }
    )
  }
}

