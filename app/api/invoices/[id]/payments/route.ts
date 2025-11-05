import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { PaymentService } from "@/lib/services/payment.service"

// GET /api/invoices/[id]/payments - Get payments for invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Verify invoice exists and check access
    const { InvoiceService } = await import("@/lib/services/invoice.service")
    const invoice = await InvoiceService.getInvoiceById(params.id)
    
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (!canAccessStore(user, invoice.storeId) && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payments = await PaymentService.listPayments({ invoiceId: params.id })

    return NextResponse.json(payments)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting invoice payments:", error)
    return NextResponse.json(
      { error: "Failed to get invoice payments" },
      { status: 500 }
    )
  }
}

