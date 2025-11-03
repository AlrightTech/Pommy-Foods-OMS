import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { InvoiceService } from "@/lib/services/invoice.service"

// GET /api/invoices/[id]/download - Generate PDF invoice
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

    // In production, generate PDF using jsPDF or similar
    // For now, return invoice data (frontend will generate PDF)
    const pdfData = {
      invoice,
      paidAmount,
      remainingAmount: Number(invoice.totalAmount) - paidAmount,
      // PDF generation will be handled in frontend component
    }

    return NextResponse.json(pdfData)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error generating invoice PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    )
  }
}

