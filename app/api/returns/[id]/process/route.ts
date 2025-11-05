import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { ReturnService } from "@/lib/services/return.service"

// POST /api/returns/[id]/process - Process return (adjusts invoice)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const returnRecord = await ReturnService.processReturn(params.id)

    return NextResponse.json(returnRecord)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error processing return:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process return" },
      { status: 500 }
    )
  }
}

