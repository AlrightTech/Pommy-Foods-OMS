import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"
import { z } from "zod"

const logTemperatureSchema = z.object({
  temperature: z.number(),
  location: z.string(),
  recordedBy: z.string().optional(),
  isManual: z.boolean().optional(),
  sensorId: z.string().optional(),
  notes: z.string().optional(),
})

// POST /api/deliveries/[id]/temperature - Log temperature for delivery
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Only drivers or admins can log temperature
    if (user.role !== "DRIVER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = logTemperatureSchema.parse(body)

    const log = await DeliveryService.logTemperature(params.id, {
      ...validatedData,
      recordedBy: validatedData.recordedBy || user.id,
    })

    return NextResponse.json(log, { status: 201 })
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

    console.error("Error logging temperature:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to log temperature" },
      { status: 500 }
    )
  }
}

