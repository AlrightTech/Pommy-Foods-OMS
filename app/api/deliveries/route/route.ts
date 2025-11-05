import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { RouteOptimizerService } from "@/lib/services/route-optimizer.service"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const optimizeRouteSchema = z.object({
  deliveryIds: z.array(z.string()).min(1),
  startLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
})

// POST /api/deliveries/route - Optimize delivery route
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = optimizeRouteSchema.parse(body)

    // Get delivery locations
    const deliveries = await prisma.delivery.findMany({
      where: {
        id: {
          in: validatedData.deliveryIds,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    })

    // Check access
    if (user.role === "DRIVER") {
      // Drivers can only optimize their own deliveries
      const invalidDeliveries = deliveries.filter((d) => d.driverId !== user.id)
      if (invalidDeliveries.length > 0) {
        return NextResponse.json(
          { error: "Some deliveries are not assigned to you" },
          { status: 403 }
        )
      }
    } else if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Map to DeliveryLocation format
    const locations = deliveries
      .filter((d) => d.store.latitude && d.store.longitude)
      .map((delivery) => ({
        id: delivery.id,
        latitude: delivery.store.latitude!,
        longitude: delivery.store.longitude!,
        address: delivery.deliveryAddress,
        storeId: delivery.storeId,
        priority: "MEDIUM" as const,
      }))

    // Optimize route
    const optimizedRoute = await RouteOptimizerService.optimizeRoute(
      locations,
      validatedData.startLocation
    )

    // Calculate total distance
    let totalDistance = 0
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      totalDistance += RouteOptimizerService.calculateDistance(
        optimizedRoute[i].latitude,
        optimizedRoute[i].longitude,
        optimizedRoute[i + 1].latitude,
        optimizedRoute[i + 1].longitude
      )
    }

    return NextResponse.json({
      route: optimizedRoute,
      totalDistance, // in km
      estimatedTime: totalDistance * 2, // Assuming average 30km/h = 2 min/km
      deliveriesCount: optimizedRoute.length,
    })
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

    console.error("Error optimizing route:", error)
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    )
  }
}

