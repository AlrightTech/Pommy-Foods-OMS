import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { PaymentService } from "@/lib/services/payment.service"
import { z } from "zod"

const uploadReceiptSchema = z.object({
  receiptUrl: z.string().url(),
})

// POST /api/payments/[id]/upload-receipt - Upload receipt for payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = uploadReceiptSchema.parse(body)

    const payment = await PaymentService.uploadReceipt(params.id, validatedData.receiptUrl)

    return NextResponse.json(payment)
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

    console.error("Error uploading receipt:", error)
    return NextResponse.json(
      { error: "Failed to upload receipt" },
      { status: 500 }
    )
  }
}

