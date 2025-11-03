import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"
import { z } from "zod"

const logTemperatureSchema = z.object({
  deliveryId: z.string(),
  temperature: z.number(),
  location: z.string(),
  notes: z.string().optional(),
})

// POST /api/driver/temperature - Log temperature (driver-specific endpoint)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only drivers can log temperature
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = logTemperatureSchema.parse(body)

    // Verify delivery is assigned to this driver
    const { DeliveryService } = await import("@/lib/services/delivery.service")
    const delivery = await DeliveryService.getDeliveryById(validatedData.deliveryId)

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    if (delivery.driverId !== user.id) {
      return NextResponse.json({ error: "Delivery is not assigned to you" }, { status: 403 })
    }

    const log = await DeliveryService.logTemperature(validatedData.deliveryId, {
      temperature: validatedData.temperature,
      location: validatedData.location,
      recordedBy: user.id,
      isManual: true,
      notes: validatedData.notes,
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

