import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"
import { z } from "zod"

const updateDeliverySchema = z.object({
  driverId: z.string().optional(),
  status: z.enum(["PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "FAILED"]).optional(),
  scheduledDate: z.string().transform((str) => new Date(str)).optional().or(z.undefined()),
  deliveryAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  signature: z.string().optional(),
  deliveryPhoto: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/deliveries/[id] - Get delivery by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const delivery = await DeliveryService.getDeliveryById(params.id)

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Check access
    if (user.role === "DRIVER" && delivery.driverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!canAccessStore(user, delivery.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(delivery)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting delivery:", error)
    return NextResponse.json(
      { error: "Failed to get delivery" },
      { status: 500 }
    )
  }
}

// PUT /api/deliveries/[id] - Update delivery
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const delivery = await DeliveryService.getDeliveryById(params.id)

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateDeliverySchema.parse(body)

    // Drivers can only update their own deliveries (limited fields)
    if (user.role === "DRIVER" && delivery.driverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Only admins can assign drivers or change status directly
    if ((validatedData.driverId || validatedData.status) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedDelivery = await DeliveryService.updateDelivery(params.id, validatedData)

    return NextResponse.json(updatedDelivery)
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

    console.error("Error updating delivery:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update delivery" },
      { status: 500 }
    )
  }
}

