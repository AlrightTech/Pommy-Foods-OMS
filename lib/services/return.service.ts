import { prisma } from "@/lib/prisma"
import type { Prisma, ReturnStatus } from "@prisma/client"

export interface CreateReturnInput {
  deliveryId: string
  returnedBy: string
  items: Array<{
    productId: string
    quantity: number
    expiryDate: Date
    reason: string
  }>
  notes?: string
}

export interface UpdateReturnInput {
  status?: ReturnStatus
  notes?: string
}

export interface ReturnFilters {
  storeId?: string
  deliveryId?: string
  status?: ReturnStatus
  startDate?: Date
  endDate?: Date
}

export class ReturnService {
  /**
   * Create a new return
   */
  static async createReturn(data: CreateReturnInput) {
    // Verify delivery exists
    const delivery = await prisma.delivery.findUnique({
      where: { id: data.deliveryId },
      include: {
        store: true,
      },
    })

    if (!delivery) {
      throw new Error("Delivery not found")
    }

    // Create return with items in transaction
    return prisma.$transaction(async (tx) => {
      const returnRecord = await tx.return.create({
        data: {
          deliveryId: data.deliveryId,
          storeId: delivery.storeId,
          returnedBy: data.returnedBy,
          reason: "expired", // Default
          status: "PENDING",
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              expiryDate: item.expiryDate,
              reason: item.reason,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          delivery: {
            select: {
              id: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                },
              },
            },
          },
        },
      })

      return returnRecord
    })
  }

  /**
   * Get return by ID
   */
  static async getReturnById(id: string) {
    return prisma.return.findUnique({
      where: { id },
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
        store: {
          select: {
            id: true,
            name: true,
            contactName: true,
          },
        },
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
        // Note: returnedBy is a userId string, not a relation in schema
        // If you need user details, fetch separately
      },
    })
  }

  /**
   * List returns with optional filters
   */
  static async listReturns(filters?: ReturnFilters) {
    const where: Prisma.ReturnWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.deliveryId) {
      where.deliveryId = filters.deliveryId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.startDate || filters?.endDate) {
      where.returnDate = {}
      if (filters.startDate) {
        where.returnDate.gte = filters.startDate
      }
      if (filters.endDate) {
        where.returnDate.lte = filters.endDate
      }
    }

    return prisma.return.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
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
      orderBy: { returnDate: "desc" },
    })
  }

  /**
   * Calculate total return value
   */
  static async calculateReturnValue(returnId: string): Promise<number> {
    const returnRecord = await prisma.return.findUnique({
      where: { id: returnId },
      include: {
        items: {
          include: {
            product: {
              select: {
                price: true,
              },
            },
          },
        },
      },
    })

    if (!returnRecord) {
      return 0
    }

    return returnRecord.items.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity
    }, 0)
  }

  /**
   * Process return (admin action)
   * This will adjust the invoice automatically
   */
  static async processReturn(returnId: string) {
    const returnRecord = await prisma.return.findUnique({
      where: { id: returnId },
      include: {
        items: {
          include: {
            product: {
              select: {
                price: true,
              },
            },
          },
        },
        delivery: {
          include: {
            order: {
              include: {
                invoice: true,
              },
            },
          },
        },
      },
    })

    if (!returnRecord) {
      throw new Error("Return not found")
    }

    if (returnRecord.status !== "PENDING") {
      throw new Error(`Cannot process return with status ${returnRecord.status}`)
    }

    // Calculate return value
    const returnValue = returnRecord.items.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity
    }, 0)

    // Update return status
    const updatedReturn = await prisma.$transaction(async (tx) => {
      const processed = await tx.return.update({
        where: { id: returnId },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
        },
      })

      // Adjust invoice if it exists
      if (returnRecord.delivery.order.invoice) {
        await tx.invoice.update({
          where: { id: returnRecord.delivery.order.invoice.id },
          data: {
            returnAdjustment: {
              increment: returnValue,
            },
            totalAmount: {
              decrement: returnValue,
            },
          },
        })
      }

      return processed
    })

    return updatedReturn
  }

  /**
   * Reject return (admin action)
   */
  static async rejectReturn(returnId: string, notes?: string) {
    const returnRecord = await prisma.return.findUnique({
      where: { id: returnId },
    })

    if (!returnRecord) {
      throw new Error("Return not found")
    }

    if (returnRecord.status !== "PENDING") {
      throw new Error(`Cannot reject return with status ${returnRecord.status}`)
    }

    return prisma.return.update({
      where: { id: returnId },
      data: {
        status: "REJECTED",
        notes: notes ? `${returnRecord.notes || ""}\n[Rejected]: ${notes}`.trim() : returnRecord.notes,
      },
    })
  }

  /**
   * Update return
   */
  static async updateReturn(id: string, data: UpdateReturnInput) {
    return prisma.return.update({
      where: { id },
      data,
    })
  }

  /**
   * Get wastage analytics
   */
  static async getWastageAnalytics(filters?: {
    storeId?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: Prisma.ReturnWhereInput = {
      status: "PROCESSED",
    }

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.startDate || filters?.endDate) {
      where.processedAt = {}
      if (filters.startDate) {
        where.processedAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.processedAt.lte = filters.endDate
      }
    }

    const returns = await prisma.return.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                category: true,
              },
            },
          },
        },
      },
    })

    // Calculate totals
    const totalValue = returns.reduce((sum, ret) => {
      const returnValue = ret.items.reduce((itemSum, item) => {
        return itemSum + Number(item.product.price) * item.quantity
      }, 0)
      return sum + returnValue
    }, 0)

    const totalQuantity = returns.reduce((sum, ret) => {
      return sum + ret.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    // Group by product
    const byProduct = returns.reduce((acc, ret) => {
      ret.items.forEach((item) => {
        const key = item.productId
        if (!acc[key]) {
          acc[key] = {
            product: item.product,
            quantity: 0,
            value: 0,
          }
        }
        acc[key].quantity += item.quantity
        acc[key].value += Number(item.product.price) * item.quantity
      })
      return acc
    }, {} as Record<string, { product: any; quantity: number; value: number }>)

    // Group by store
    const byStore = await prisma.return.groupBy({
      by: ["storeId"],
      where,
      _count: {
        id: true,
      },
    })

    return {
      totalReturns: returns.length,
      totalQuantity,
      totalValue,
      byProduct: Object.values(byProduct),
      byStore: byStore.length,
    }
  }
}

