import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"
import { z } from "zod"

const updateReturnSchema = z.object({
  status: z.enum(["PENDING", "PROCESSED", "REJECTED"]).optional(),
  notes: z.string().optional(),
})

// GET /api/returns/[id] - Get return by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const returnRecord = await ReturnService.getReturnById(params.id)

    if (!returnRecord) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 })
    }

    // Check access
    if (!canAccessStore(user, returnRecord.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Calculate return value
    const returnValue = await ReturnService.calculateReturnValue(params.id)
    
    return NextResponse.json({
      ...returnRecord,
      returnValue,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting return:", error)
    return NextResponse.json(
      { error: "Failed to get return" },
      { status: 500 }
    )
  }
}

// PUT /api/returns/[id] - Update return
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Only admins can update returns
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateReturnSchema.parse(body)

    const returnRecord = await ReturnService.updateReturn(params.id, validatedData)

    return NextResponse.json(returnRecord)
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

    console.error("Error updating return:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update return" },
      { status: 500 }
    )
  }
}

