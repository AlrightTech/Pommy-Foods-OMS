import { prisma } from "@/lib/prisma"
import type { Prisma, DeliveryStatus } from "@prisma/client"

export interface CreateDeliveryInput {
  orderId: string
  scheduledDate: Date
  deliveryAddress?: string
  latitude?: number
  longitude?: number
}

export interface UpdateDeliveryInput {
  driverId?: string
  status?: DeliveryStatus
  scheduledDate?: Date
  deliveryAddress?: string
  latitude?: number
  longitude?: number
  signature?: string
  deliveryPhoto?: string
  notes?: string
}

export interface DeliveryFilters {
  storeId?: string
  driverId?: string
  status?: DeliveryStatus
  scheduledDateStart?: Date
  scheduledDateEnd?: Date
}

export class DeliveryService {
  /**
   * Generate delivery note from approved order
   */
  static async generateDeliveryNote(orderId: string, scheduledDate?: Date) {
    // Check if delivery already exists
    const existing = await prisma.delivery.findUnique({
      where: { orderId },
    })

    if (existing) {
      return existing
    }

    // Get order with store info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        kitchenSheet: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Only generate delivery for READY orders (kitchen completed)
    if (order.status !== "READY") {
      throw new Error(`Cannot generate delivery for order with status ${order.status}`)
    }

    // Use store address if delivery address not specified
    const deliveryAddress = 
      order.store.address + 
      (order.store.city ? `, ${order.store.city}` : "") + 
      (order.store.region ? `, ${order.store.region}` : "")

    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        storeId: order.storeId,
        status: "PENDING",
        scheduledDate: scheduledDate || new Date(),
        deliveryAddress,
        latitude: order.store.latitude || undefined,
        longitude: order.store.longitude || undefined,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
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
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            contactName: true,
            phone: true,
          },
        },
      },
    })

    // Update order status to IN_DELIVERY
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "IN_DELIVERY" },
    })

    return delivery
  }

  /**
   * Get delivery by ID
   */
  static async getDeliveryById(id: string) {
    return prisma.delivery.findUnique({
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
            latitude: true,
            longitude: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        temperatureLogs: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
        returns: {
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
          },
        },
        payment: true,
      },
    })
  }

  /**
   * List deliveries with optional filters
   */
  static async listDeliveries(filters?: DeliveryFilters) {
    const where: Prisma.DeliveryWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.driverId) {
      where.driverId = filters.driverId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.scheduledDateStart || filters?.scheduledDateEnd) {
      where.scheduledDate = {}
      if (filters.scheduledDateStart) {
        where.scheduledDate.gte = filters.scheduledDateStart
      }
      if (filters.scheduledDateEnd) {
        where.scheduledDate.lte = filters.scheduledDateEnd
      }
    }

    return prisma.delivery.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            city: true,
            region: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    })
  }

  /**
   * Update delivery
   */
  static async updateDelivery(id: string, data: UpdateDeliveryInput) {
    return prisma.delivery.update({
      where: { id },
      data,
      include: {
        order: true,
        store: true,
        driver: true,
      },
    })
  }

  /**
   * Assign driver to delivery
   */
  static async assignDriver(deliveryId: string, driverId: string) {
    // Verify driver exists and has DRIVER role
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      select: { role: true },
    })

    if (!driver || driver.role !== "DRIVER") {
      throw new Error("Invalid driver ID or user is not a driver")
    }

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        driverId,
        status: "ASSIGNED",
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    })

    // Send notification to driver
    try {
      const { NotificationService } = await import("./notification.service")
      await NotificationService.notifyDeliveryAssigned(
        deliveryId,
        driverId,
        delivery.order.orderNumber
      )
    } catch (error) {
      console.error("Error sending delivery assignment notification:", error)
    }

    return delivery
  }

  /**
   * Start delivery (driver action)
   */
  static async startDelivery(deliveryId: string, driverId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    })

    if (!delivery) {
      throw new Error("Delivery not found")
    }

    if (delivery.driverId !== driverId) {
      throw new Error("Delivery is not assigned to this driver")
    }

    if (delivery.status !== "ASSIGNED") {
      throw new Error(`Cannot start delivery with status ${delivery.status}`)
    }

    return prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: "IN_TRANSIT" },
    })
  }

  /**
   * Complete delivery (driver action)
   */
  static async completeDelivery(
    deliveryId: string,
    driverId: string,
    data: {
      signature?: string
      deliveryPhoto?: string
      notes?: string
    }
  ) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    })

    if (!delivery) {
      throw new Error("Delivery not found")
    }

    if (delivery.driverId !== driverId) {
      throw new Error("Delivery is not assigned to this driver")
    }

    if (delivery.status !== "IN_TRANSIT") {
      throw new Error(`Cannot complete delivery with status ${delivery.status}`)
    }

    const completedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        signature: data.signature,
        deliveryPhoto: data.deliveryPhoto,
        notes: data.notes,
      },
      include: {
        order: true,
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: "DELIVERED" },
    })

    return completedDelivery
  }

  /**
   * Log temperature for delivery
   */
  static async logTemperature(
    deliveryId: string,
    data: {
      temperature: number
      location: string
      recordedBy?: string
      isManual?: boolean
      sensorId?: string
      notes?: string
    }
  ) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    })

    if (!delivery) {
      throw new Error("Delivery not found")
    }

    const log = await prisma.temperatureLog.create({
      data: {
        deliveryId,
        storeId: delivery.storeId,
        temperature: data.temperature,
        location: data.location,
        recordedBy: data.recordedBy,
        isManual: data.isManual ?? true,
        sensorId: data.sensorId,
        notes: data.notes,
      },
    })

    return log
  }

  /**
   * Get deliveries for a specific driver
   */
  static async getDriverDeliveries(driverId: string, filters?: {
    status?: DeliveryStatus
    date?: Date
  }) {
    const where: Prisma.DeliveryWhereInput = {
      driverId,
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filters.date)
      endOfDay.setHours(23, 59, 59, 999)

      where.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    return prisma.delivery.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
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
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            region: true,
            phone: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    })
  }

  /**
   * Auto-generate deliveries for all ready orders
   */
  static async autoGenerateDeliveries(scheduledDate?: Date) {
    const readyOrders = await prisma.order.findMany({
      where: {
        status: "READY",
        delivery: null,
      },
      include: {
        store: true,
      },
    })

    const generated = []

    for (const order of readyOrders) {
      try {
        const delivery = await this.generateDeliveryNote(
          order.id,
          scheduledDate
        )
        generated.push(delivery.id)
      } catch (error) {
        console.error(`Error generating delivery for order ${order.id}:`, error)
      }
    }

    return {
      ordersProcessed: readyOrders.length,
      deliveriesGenerated: generated.length,
      deliveryIds: generated,
    }
  }
}

