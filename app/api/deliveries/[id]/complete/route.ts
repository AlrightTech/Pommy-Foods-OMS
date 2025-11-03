import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"
import { z } from "zod"

const completeDeliverySchema = z.object({
  signature: z.string().optional(),
  deliveryPhoto: z.string().optional(),
  notes: z.string().optional(),
})

// POST /api/deliveries/[id]/complete - Complete delivery (driver action)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Only drivers can complete deliveries
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = completeDeliverySchema.parse(body)

    const delivery = await DeliveryService.completeDelivery(params.id, user.id, validatedData)

    return NextResponse.json(delivery)
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

    console.error("Error completing delivery:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete delivery" },
      { status: 500 }
    )
  }
}

