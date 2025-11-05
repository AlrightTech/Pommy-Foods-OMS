import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"
import { z } from "zod"

const rejectReturnSchema = z.object({
  notes: z.string().optional(),
})

// POST /api/returns/[id]/reject - Reject return
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const body = await request.json().catch(() => ({}))
    const validatedData = rejectReturnSchema.parse(body)

    const returnRecord = await ReturnService.rejectReturn(params.id, validatedData.notes)

    return NextResponse.json(returnRecord)
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

    console.error("Error rejecting return:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reject return" },
      { status: 500 }
    )
  }
}

