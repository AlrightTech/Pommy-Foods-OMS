import { prisma } from "@/lib/prisma"
import type { Prisma, InvoiceStatus } from "@prisma/client"

export interface CreateInvoiceInput {
  orderId: string
  discount?: number
  tax?: number
  dueDate?: Date
}

export interface UpdateInvoiceInput {
  discount?: number
  tax?: number
  returnAdjustment?: number
  dueDate?: Date
  status?: InvoiceStatus
}

export interface InvoiceFilters {
  storeId?: string
  status?: InvoiceStatus
  startDate?: Date
  endDate?: Date
  dueDateStart?: Date
  dueDateEnd?: Date
  search?: string
}

export class InvoiceService {
  /**
   * Generate unique invoice number
   */
  private static async generateInvoiceNumber(): Promise<string> {
    const prefix = "INV-"
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    
    // Get count of invoices today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    
    const count = await prisma.invoice.count({
      where: {
        issuedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const sequence = String(count + 1).padStart(4, "0")
    return `${prefix}${dateStr}-${sequence}`
  }

  /**
   * Generate invoice from delivered order
   */
  static async generateInvoice(orderId: string, data?: CreateInvoiceInput) {
    // Check if invoice already exists
    const existing = await prisma.invoice.findUnique({
      where: { orderId },
    })

    if (existing) {
      return existing
    }

    // Get delivered order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "DELIVERED") {
      throw new Error(`Cannot generate invoice for order with status ${order.status}`)
    }

    // Calculate totals
    const subtotal = Number(order.totalAmount)
    const discount = data?.discount || 0
    const tax = data?.tax || subtotal * 0.1 // Default 10% tax
    const returnAdjustment = 0 // Will be updated if returns are processed
    const totalAmount = subtotal - discount + tax - returnAdjustment

    // Calculate due date (default: 30 days from now)
    const dueDate = data?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber()

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        storeId: order.storeId,
        subtotal,
        discount,
        tax,
        returnAdjustment,
        totalAmount,
        dueDate,
        status: "PENDING",
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            region: true,
          },
        },
      },
    })

    // Send notification to store
    try {
      const { NotificationService } = await import("./notification.service")
      await NotificationService.notifyInvoiceGenerated(invoice.id, invoiceNumber, order.storeId)
    } catch (error) {
      console.error("Error sending invoice generation notification:", error)
    }

    return invoice
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            region: true,
            creditLimit: true,
            paymentTerms: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    })
  }

  /**
   * List invoices with optional filters
   */
  static async listInvoices(filters?: InvoiceFilters) {
    const where: Prisma.InvoiceWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.startDate || filters?.endDate) {
      where.issuedAt = {}
      if (filters.startDate) {
        where.issuedAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.issuedAt.lte = filters.endDate
      }
    }

    if (filters?.dueDateStart || filters?.dueDateEnd) {
      where.dueDate = {}
      if (filters.dueDateStart) {
        where.dueDate.gte = filters.dueDateStart
      }
      if (filters.dueDateEnd) {
        where.dueDate.lte = filters.dueDateEnd
      }
    }

    if (filters?.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
        { order: { orderNumber: { contains: filters.search, mode: "insensitive" } } },
      ]
    }

    return prisma.invoice.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          select: {
            amount: true,
            paymentDate: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    })
  }

  /**
   * Update invoice
   */
  static async updateInvoice(id: string, data: UpdateInvoiceInput) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      throw new Error("Invoice not found")
    }

    // Recalculate total if discount, tax, or returnAdjustment changed
    let totalAmount = invoice.totalAmount
    if (data.discount !== undefined || data.tax !== undefined || data.returnAdjustment !== undefined) {
      const subtotal = Number(invoice.subtotal)
      const discount = data.discount ?? Number(invoice.discount)
      const tax = data.tax ?? Number(invoice.tax)
      const returnAdjustment = data.returnAdjustment ?? Number(invoice.returnAdjustment)
      totalAmount = subtotal - discount + tax - returnAdjustment
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        totalAmount,
      },
      include: {
        payments: true,
      },
    })
  }

  /**
   * Calculate paid amount
   */
  static async calculatePaidAmount(invoiceId: string): Promise<number> {
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      select: { amount: true },
    })

    return payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  }

  /**
   * Update invoice status based on payments
   */
  static async updateInvoiceStatus(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
      },
    })

    if (!invoice) {
      throw new Error("Invoice not found")
    }

    const paidAmount = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalAmount = Number(invoice.totalAmount)
    const remainingAmount = totalAmount - paidAmount

    let status: InvoiceStatus = invoice.status

    if (paidAmount >= totalAmount) {
      status = "PAID"
    } else if (paidAmount > 0) {
      status = "PARTIAL"
    } else if (new Date() > invoice.dueDate) {
      status = "OVERDUE"
    } else {
      status = "PENDING"
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : invoice.paidAt,
      },
    })

    return {
      invoice: updatedInvoice,
      paidAmount,
      remainingAmount,
    }
  }

  /**
   * Auto-generate invoices for all delivered orders without invoices
   */
  static async autoGenerateInvoices() {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        invoice: null,
      },
    })

    const generated = []

    for (const order of deliveredOrders) {
      try {
        const invoice = await this.generateInvoice(order.id)
        generated.push(invoice.id)
      } catch (error) {
        console.error(`Error generating invoice for order ${order.id}:`, error)
      }
    }

    return {
      ordersProcessed: deliveredOrders.length,
      invoicesGenerated: generated.length,
      invoiceIds: generated,
    }
  }
}

