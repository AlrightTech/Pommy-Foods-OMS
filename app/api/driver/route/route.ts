import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { RouteOptimizerService } from "@/lib/services/route-optimizer.service"
import { z } from "zod"

const optimizeDriverRouteSchema = z.object({
  startLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
})

// POST /api/driver/route - Optimize route for current driver's deliveries
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only drivers can optimize their routes
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const validatedData = optimizeDriverRouteSchema.parse(body)

    const result = await RouteOptimizerService.optimizeDriverRoute(
      user.id,
      validatedData.startLocation
    )

    return NextResponse.json(result)
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

    console.error("Error optimizing driver route:", error)
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    )
  }
}

