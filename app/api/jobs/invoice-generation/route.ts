import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { generateInvoicesForDeliveredOrders } from "@/lib/jobs/invoice-generation"

// POST /api/jobs/invoice-generation - Trigger invoice generation manually
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const result = await generateInvoicesForDeliveredOrders()

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error running invoice generation:", error)
    return NextResponse.json(
      { error: "Failed to run invoice generation" },
      { status: 500 }
    )
  }
}

