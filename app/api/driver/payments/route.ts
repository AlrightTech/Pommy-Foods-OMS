import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { PaymentService } from "@/lib/services/payment.service"
import { z } from "zod"

const createPaymentSchema = z.object({
  invoiceId: z.string(),
  deliveryId: z.string().optional(),
  amount: z.number().positive(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
})

// POST /api/driver/payments - Create cash payment (driver-specific endpoint)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only drivers can create cash payments
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // Verify delivery belongs to driver if deliveryId is provided
    if (validatedData.deliveryId) {
      const { DeliveryService } = await import("@/lib/services/delivery.service")
      const delivery = await DeliveryService.getDeliveryById(validatedData.deliveryId)
      
      if (!delivery) {
        return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
      }

      if (delivery.driverId !== user.id) {
        return NextResponse.json({ error: "Delivery is not assigned to you" }, { status: 403 })
      }
    }

    const payment = await PaymentService.createPayment({
      invoiceId: validatedData.invoiceId,
      deliveryId: validatedData.deliveryId,
      amount: validatedData.amount,
      paymentMethod: "CASH",
      receiptUrl: validatedData.receiptUrl,
      collectedBy: user.id,
      notes: validatedData.notes,
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

