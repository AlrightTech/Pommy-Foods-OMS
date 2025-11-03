import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { TemperatureService } from "@/lib/services/temperature.service"
import { z } from "zod"

const createTemperatureLogSchema = z.object({
  deliveryId: z.string().optional(),
  storeId: z.string(),
  temperature: z.number(),
  location: z.string(),
  isManual: z.boolean().optional(),
  sensorId: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/temperature - List temperature logs
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    
    const filters = {
      deliveryId: searchParams.get("deliveryId") || undefined,
      storeId: searchParams.get("storeId") || undefined,
      location: searchParams.get("location") || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      compliant: searchParams.get("compliant") === "true" ? true : searchParams.get("compliant") === "false" ? false : undefined,
    }

    // Store owners/managers can only see their store's logs
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores' logs
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    let logs = await TemperatureService.listTemperatureLogs(filters)

    // Filter by compliance if specified
    if (filters.compliant !== undefined) {
      logs = logs.filter((log) => log.isCompliant === filters.compliant)
    }

    return NextResponse.json(logs)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing temperature logs:", error)
    return NextResponse.json(
      { error: "Failed to list temperature logs" },
      { status: 500 }
    )
  }
}

// POST /api/temperature - Create temperature log
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only drivers or admins can log temperature
    if (user.role !== "DRIVER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTemperatureLogSchema.parse(body)

    // Check access to store if specified
    if (validatedData.storeId && !canAccessStore(user, validatedData.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const log = await TemperatureService.createTemperatureLog({
      ...validatedData,
      recordedBy: user.id,
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

    console.error("Error creating temperature log:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create temperature log" },
      { status: 500 }
    )
  }
}

