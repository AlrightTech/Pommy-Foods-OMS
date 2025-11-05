import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { DeliveryService } from "@/lib/services/delivery.service"

// GET /api/deliveries - List deliveries
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      driverId: searchParams.get("driverId") || undefined,
      status: searchParams.get("status") as any || undefined,
      scheduledDateStart: searchParams.get("scheduledDateStart") 
        ? new Date(searchParams.get("scheduledDateStart")!) 
        : undefined,
      scheduledDateEnd: searchParams.get("scheduledDateEnd")
        ? new Date(searchParams.get("scheduledDateEnd")!)
        : undefined,
    }

    // Drivers can only see their own deliveries
    if (user.role === "DRIVER") {
      filters.driverId = user.id
    }

    // Store owners/managers can only see their store's deliveries
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores' deliveries
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const deliveries = await DeliveryService.listDeliveries(filters)

    return NextResponse.json(deliveries)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing deliveries:", error)
    return NextResponse.json(
      { error: "Failed to list deliveries" },
      { status: 500 }
    )
  }
}

// POST /api/deliveries - Generate delivery from order
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Only admins can manually generate deliveries
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, scheduledDate } = body

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const delivery = await DeliveryService.generateDeliveryNote(
      orderId,
      scheduledDate ? new Date(scheduledDate) : undefined
    )

    return NextResponse.json(delivery, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error generating delivery:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate delivery" },
      { status: 500 }
    )
  }
}

