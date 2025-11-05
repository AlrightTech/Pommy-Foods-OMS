import { NextRequest, NextResponse } from "next/server"
import { requireAuth, canAccessStore } from "@/lib/auth-helpers"
import { InvoiceService } from "@/lib/services/invoice.service"
import { z } from "zod"

const createInvoiceSchema = z.object({
  orderId: z.string(),
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional().or(z.undefined()),
})

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    
    const filters = {
      storeId: searchParams.get("storeId") || undefined,
      status: searchParams.get("status") as any || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      dueDateStart: searchParams.get("dueDateStart")
        ? new Date(searchParams.get("dueDateStart")!)
        : undefined,
      dueDateEnd: searchParams.get("dueDateEnd")
        ? new Date(searchParams.get("dueDateEnd")!)
        : undefined,
      search: searchParams.get("search") || undefined,
    }

    // Store owners/managers can only see their store's invoices
    if (!filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!user.storeId) {
        return NextResponse.json({ error: "Store not assigned" }, { status: 400 })
      }
      filters.storeId = user.storeId
    }

    // Non-admins cannot access other stores' invoices
    if (filters.storeId && (user.role === "STORE_OWNER" || user.role === "STORE_MANAGER")) {
      if (!canAccessStore(user, filters.storeId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const invoices = await InvoiceService.listInvoices(filters)

    // Calculate paid amounts for each invoice
    const invoicesWithPayments = await Promise.all(
      invoices.map(async (invoice) => {
        const paidAmount = await InvoiceService.calculatePaidAmount(invoice.id)
        return {
          ...invoice,
          paidAmount,
          remainingAmount: Number(invoice.totalAmount) - paidAmount,
        }
      })
    )

    return NextResponse.json(invoicesWithPayments)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing invoices:", error)
    return NextResponse.json(
      { error: "Failed to list invoices" },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Generate invoice from order
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Only admins can manually generate invoices
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createInvoiceSchema.parse(body)

    const invoice = await InvoiceService.generateInvoice(
      validatedData.orderId,
      validatedData
    )

    return NextResponse.json(invoice, { status: 201 })
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

    console.error("Error generating invoice:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate invoice" },
      { status: 500 }
    )
  }
}

