import { prisma } from "@/lib/prisma"
import type { Prisma, OrderStatus, OrderType } from "@prisma/client"

export interface CreateOrderInput {
  storeId: string
  createdById: string
  orderType: OrderType
  items: Array<{
    productId: string
    quantity: number
  }>
  notes?: string
}

export interface UpdateOrderInput {
  notes?: string
  status?: OrderStatus
}

export interface UpdateOrderItemsInput {
  items: Array<{
    productId: string
    quantity: number
  }>
}

export interface OrderFilters {
  storeId?: string
  status?: OrderStatus
  orderType?: OrderType
  startDate?: Date
  endDate?: Date
  search?: string
}

export class OrderService {
  /**
   * Generate unique order number
   */
  private static async generateOrderNumber(): Promise<string> {
    const prefix = "ORD-"
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    
    // Get count of orders today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const sequence = String(count + 1).padStart(4, "0")
    return `${prefix}${dateStr}-${sequence}`
  }

  /**
   * Calculate order total from items
   */
  private static async calculateTotal(items: Array<{ productId: string; quantity: number }>): Promise<number> {
    let total = 0

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true },
      })

      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      total += Number(product.price) * item.quantity
    }

    return total
  }

  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderInput) {
    // Calculate total
    const totalAmount = await this.calculateTotal(data.items)

    // Generate order number
    const orderNumber = await this.generateOrderNumber()

    // Create order with items in transaction
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          storeId: data.storeId,
          createdById: data.createdById,
          orderType: data.orderType,
          status: "DRAFT",
          totalAmount,
          notes: data.notes,
          items: {
            create: await Promise.all(
              data.items.map(async (item) => {
                const product = await tx.product.findUniqueOrThrow({
                  where: { id: item.productId },
                })

                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: product.price,
                  totalPrice: Number(product.price) * item.quantity,
                }
              })
            ),
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
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return order
    })
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string) {
    return prisma.order.findUnique({
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
                category: true,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        kitchenSheet: {
          include: {
            items: true,
          },
        },
        delivery: true,
        invoice: true,
      },
    })
  }

  /**
   * List orders with optional filters
   */
  static async listOrders(filters?: OrderFilters) {
    const where: Prisma.OrderWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.orderType) {
      where.orderType = filters.orderType
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        { store: { name: { contains: filters.search, mode: "insensitive" } } },
      ]
    }

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
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
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Update order (basic fields)
   */
  static async updateOrder(id: string, data: UpdateOrderInput) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  /**
   * Update order items (requires recalculation)
   */
  static async updateOrderItems(id: string, data: UpdateOrderItemsInput) {
    // Get current order
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Only allow updates for DRAFT or PENDING orders
    if (order.status !== "DRAFT" && order.status !== "PENDING") {
      throw new Error(`Cannot update order with status ${order.status}`)
    }

    // Calculate new total
    const totalAmount = await this.calculateTotal(data.items)

    // Update order and items in transaction
    return prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      })

      // Create new items
      const newItems = await Promise.all(
        data.items.map(async (item) => {
          const product = await tx.product.findUniqueOrThrow({
            where: { id: item.productId },
          })

          return tx.orderItem.create({
            data: {
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
              totalPrice: Number(product.price) * item.quantity,
            },
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
          })
        })
      )

      // Update order total
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { totalAmount },
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
        },
      })

      return updatedOrder
    })
  }

  /**
   * Approve order (admin action)
   */
  static async approveOrder(id: string, approvedById: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "DRAFT" && order.status !== "PENDING") {
      throw new Error(`Cannot approve order with status ${order.status}`)
    }

    // Update order status
    const approvedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    })

    // Send notification to store
    try {
      const { NotificationService } = await import("./notification.service")
      await NotificationService.notifyOrderApproved(id, order.storeId)
    } catch (error) {
      console.error("Error sending order approval notification:", error)
    }

    return approvedOrder
  }

  /**
   * Reject order (admin action)
   */
  static async rejectOrder(id: string, notes?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "DRAFT" && order.status !== "PENDING") {
      throw new Error(`Cannot reject order with status ${order.status}`)
    }

    const rejectedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "REJECTED",
        notes: notes ? `${order.notes || ""}\n[Rejected]: ${notes}`.trim() : order.notes,
      },
    })

    // Send notification to store
    try {
      const { NotificationService } = await import("./notification.service")
      await NotificationService.notifyOrderRejected(id, order.storeId, notes)
    } catch (error) {
      console.error("Error sending order rejection notification:", error)
    }

    return rejectedOrder
  }

  /**
   * Cancel order
   */
  static async cancelOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Only allow cancellation for certain statuses
    const cancellableStatuses: OrderStatus[] = ["DRAFT", "PENDING", "APPROVED"]
    if (!cancellableStatuses.includes(order.status)) {
      throw new Error(`Cannot cancel order with status ${order.status}`)
    }

    return prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    })
  }

  /**
   * Get draft orders (auto-generated)
   */
  static async getDraftOrders(storeId?: string) {
    const where: Prisma.OrderWhereInput = {
      status: "DRAFT",
      orderType: "AUTO_REPLENISH",
    }

    if (storeId) {
      where.storeId = storeId
    }

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
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
      },
      orderBy: { createdAt: "desc" },
    })
  }
}

