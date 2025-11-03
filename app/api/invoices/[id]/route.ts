import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { InvoiceService } from "@/lib/services/invoice.service"
import { z } from "zod"

const updateInvoiceSchema = z.object({
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  returnAdjustment: z.number().nonnegative().optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional().or(z.undefined()),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]).optional(),
})

// GET /api/invoices/[id] - Get invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const invoice = await InvoiceService.getInvoiceById(params.id)

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Check access
    if (!canAccessStore(user, invoice.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Calculate paid amount
    const paidAmount = await InvoiceService.calculatePaidAmount(params.id)
    const remainingAmount = Number(invoice.totalAmount) - paidAmount

    return NextResponse.json({
      ...invoice,
      paidAmount,
      remainingAmount,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting invoice:", error)
    return NextResponse.json(
      { error: "Failed to get invoice" },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Only admins can update invoices
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateInvoiceSchema.parse(body)

    const invoice = await InvoiceService.updateInvoice(params.id, validatedData)

    // Recalculate status if needed
    await InvoiceService.updateInvoiceStatus(params.id)

    return NextResponse.json(invoice)
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

    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update invoice" },
      { status: 500 }
    )
  }
}

