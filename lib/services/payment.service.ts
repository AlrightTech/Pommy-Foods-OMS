import { prisma } from "@/lib/prisma"
import { InvoiceService } from "./invoice.service"
import type { PaymentMethod } from "@prisma/client"

export interface CreatePaymentInput {
  invoiceId: string
  deliveryId?: string
  amount: number
  paymentMethod: PaymentMethod
  transactionId?: string
  receiptUrl?: string
  collectedBy?: string
  notes?: string
}

export interface PaymentFilters {
  invoiceId?: string
  storeId?: string
  paymentMethod?: PaymentMethod
  startDate?: Date
  endDate?: Date
}

export class PaymentService {
  /**
   * Create payment
   */
  static async createPayment(data: CreatePaymentInput) {
    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        payments: true,
      },
    })

    if (!invoice) {
      throw new Error("Invoice not found")
    }

    // Calculate current paid amount
    const currentPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalAmount = Number(invoice.totalAmount)
    const remaining = totalAmount - currentPaid

    // Validate payment amount
    if (data.amount > remaining) {
      throw new Error(`Payment amount (${data.amount}) exceeds remaining balance (${remaining})`)
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        deliveryId: data.deliveryId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        receiptUrl: data.receiptUrl,
        collectedBy: data.collectedBy,
        notes: data.notes,
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
          },
        },
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
          },
        },
      },
    })

    // Update invoice status
    const invoiceUpdate = await InvoiceService.updateInvoiceStatus(data.invoiceId)

    // Send notification if invoice is fully paid
    if (invoiceUpdate.invoice.status === "PAID") {
      try {
        const { NotificationService } = await import("./notification.service")
        await NotificationService.notifyPaymentReceived(
          data.invoiceId,
          invoiceUpdate.invoice.invoiceNumber || "",
          data.amount,
          invoiceUpdate.invoice.storeId
        )
      } catch (error) {
        console.error("Error sending payment notification:", error)
      }
    }

    return payment
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * List payments with optional filters
   */
  static async listPayments(filters?: PaymentFilters) {
    const where: any = {}

    if (filters?.invoiceId) {
      where.invoiceId = filters.invoiceId
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod
    }

    if (filters?.startDate || filters?.endDate) {
      where.paymentDate = {}
      if (filters.startDate) {
        where.paymentDate.gte = filters.startDate
      }
      if (filters.endDate) {
        where.paymentDate.lte = filters.endDate
      }
    }

    // Filter by store via invoice
    if (filters?.storeId) {
      where.invoice = {
        storeId: filters.storeId,
      }
    }

    return prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    })
  }

  /**
   * Upload receipt for payment
   */
  static async uploadReceipt(paymentId: string, receiptUrl: string) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { receiptUrl },
    })
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStatistics(filters?: {
    storeId?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (filters?.startDate || filters?.endDate) {
      where.paymentDate = {}
      if (filters.startDate) {
        where.paymentDate.gte = filters.startDate
      }
      if (filters.endDate) {
        where.paymentDate.lte = filters.endDate
      }
    }

    if (filters?.storeId) {
      where.invoice = {
        storeId: filters.storeId,
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: {
            storeId: true,
          },
        },
      },
    })

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Group by payment method
    const byMethod = payments.reduce((acc, p) => {
      const method = p.paymentMethod
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 }
      }
      acc[method].count++
      acc[method].amount += Number(p.amount)
      return acc
    }, {} as Record<PaymentMethod, { count: number; amount: number }>)

    // Group by store
    const byStore = payments.reduce((acc, p) => {
      const storeId = p.invoice.storeId
      if (!acc[storeId]) {
        acc[storeId] = { count: 0, amount: 0 }
      }
      acc[storeId].count++
      acc[storeId].amount += Number(p.amount)
      return acc
    }, {} as Record<string, { count: number; amount: number }>)

    return {
      totalPayments: payments.length,
      totalAmount,
      byMethod,
      byStore: Object.keys(byStore).length,
    }
  }
}

