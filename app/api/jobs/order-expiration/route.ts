import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { cancelExpiredDraftOrders } from "@/lib/jobs/order-expiration"
import { z } from "zod"

const cancelExpiredSchema = z.object({
  daysOld: z.number().int().positive().optional().default(7),
})

// POST /api/jobs/order-expiration - Cancel expired draft orders manually
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"])

    const body = await request.json().catch(() => ({}))
    const validatedData = cancelExpiredSchema.parse(body)

    const result = await cancelExpiredDraftOrders(validatedData.daysOld)

    return NextResponse.json(result)
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

    console.error("Error running order expiration:", error)
    return NextResponse.json(
      { error: "Failed to run order expiration" },
      { status: 500 }
    )
  }
}

