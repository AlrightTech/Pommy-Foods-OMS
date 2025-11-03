import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { PaymentService } from "@/lib/services/payment.service"

// GET /api/payments/[id] - Get payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const payment = await PaymentService.getPaymentById(params.id)

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting payment:", error)
    return NextResponse.json(
      { error: "Failed to get payment" },
      { status: 500 }
    )
  }
}

