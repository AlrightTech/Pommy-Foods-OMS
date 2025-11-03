import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"
import { z } from "zod"

const createReturnSchema = z.object({
  deliveryId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      expiryDate: z.string().transform((str) => new Date(str)),
      reason: z.string().default("expired"),
    })
  ).min(1),
  notes: z.string().optional(),
})

// POST /api/driver/returns - Create return (driver-specific endpoint)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only drivers can create returns
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createReturnSchema.parse(body)

    const returnRecord = await ReturnService.createReturn({
      ...validatedData,
      returnedBy: user.id,
    })

    return NextResponse.json(returnRecord, { status: 201 })
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

    console.error("Error creating return:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create return" },
      { status: 500 }
    )
  }
}

