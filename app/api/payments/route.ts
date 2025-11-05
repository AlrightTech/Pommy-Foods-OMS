import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { PaymentService } from "@/lib/services/payment.service"
import { z } from "zod"

const createPaymentSchema = z.object({
  invoiceId: z.string(),
  deliveryId: z.string().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "DIRECT_DEBIT", "ONLINE_PAYMENT", "BANK_TRANSFER"]),
  transactionId: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/payments - List payments
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const filters = {
      invoiceId: searchParams.get("invoiceId") || undefined,
      storeId: searchParams.get("storeId") || undefined,
      paymentMethod: searchParams.get("paymentMethod") as any || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    }

    const payments = await PaymentService.listPayments(filters)

    return NextResponse.json(payments)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing payments:", error)
    return NextResponse.json(
      { error: "Failed to list payments" },
      { status: 500 }
    )
  }
}

// POST /api/payments - Create payment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // Drivers can only record cash payments for their deliveries
    if (user.role === "DRIVER") {
      if (validatedData.paymentMethod !== "CASH" || !validatedData.deliveryId) {
        return NextResponse.json(
          { error: "Drivers can only record cash payments for their deliveries" },
          { status: 403 }
        )
      }
    }

    const payment = await PaymentService.createPayment({
      ...validatedData,
      collectedBy: user.role === "DRIVER" ? user.id : undefined,
    })

    return NextResponse.json(payment, { status: 201 })
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

    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment" },
      { status: 500 }
    )
  }
}

