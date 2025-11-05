import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"
import { z } from "zod"

const assignDriverSchema = z.object({
  driverId: z.string().min(1),
})

// POST /api/deliveries/[id]/assign - Assign driver to delivery
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const body = await request.json()
    const validatedData = assignDriverSchema.parse(body)

    const delivery = await DeliveryService.assignDriver(params.id, validatedData.driverId)

    return NextResponse.json(delivery)
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

    console.error("Error assigning driver:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign driver" },
      { status: 500 }
    )
  }
}

