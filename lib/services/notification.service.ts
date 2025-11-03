import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@prisma/client"

export interface CreateNotificationInput {
  userId: string
  title: string
  message: string
  type: NotificationType
  relatedId?: string
  relatedType?: string
}

export interface NotificationFilters {
  userId?: string
  isRead?: boolean
  type?: NotificationType
  startDate?: Date
  endDate?: Date
}

export class NotificationService {
  /**
   * Create a notification
   */
  static async createNotification(data: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
      },
    })
  }

  /**
   * Create notifications for multiple users
   */
  static async createNotificationsForUsers(
    userIds: string[],
    data: Omit<CreateNotificationInput, "userId">
  ) {
    const notifications = userIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
    }))

    return prisma.notification.createMany({
      data: notifications,
    })
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    })
  }

  /**
   * List notifications with optional filters
   */
  static async listNotifications(filters?: NotificationFilters) {
    const where: any = {}

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead
    }

    if (filters?.type) {
      where.type = filters.type
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

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    })
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
  }

  /**
   * Delete notification
   */
  static async deleteNotification(id: string) {
    return prisma.notification.delete({
      where: { id },
    })
  }

  /**
   * Helper: Notify store owner of order approval
   */
  static async notifyOrderApproved(orderId: string, storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        users: {
          where: {
            role: {
              in: ["STORE_OWNER", "STORE_MANAGER"],
            },
            isActive: true,
          },
        },
      },
    })

    if (!store) return

    const userIds = store.users.map((u) => u.id)

    if (userIds.length > 0) {
      await this.createNotificationsForUsers(userIds, {
        title: "Order Approved",
        message: `Your order ${orderId} has been approved and is ready for kitchen preparation.`,
        type: "ORDER_APPROVED",
        relatedId: orderId,
        relatedType: "order",
      })
    }
  }

  /**
   * Helper: Notify store owner of order rejection
   */
  static async notifyOrderRejected(orderId: string, storeId: string, notes?: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        users: {
          where: {
            role: {
              in: ["STORE_OWNER", "STORE_MANAGER"],
            },
            isActive: true,
          },
        },
      },
    })

    if (!store) return

    const userIds = store.users.map((u) => u.id)

    if (userIds.length > 0) {
      await this.createNotificationsForUsers(userIds, {
        title: "Order Rejected",
        message: `Your order ${orderId} has been rejected.${notes ? ` Reason: ${notes}` : ""}`,
        type: "ORDER_REJECTED",
        relatedId: orderId,
        relatedType: "order",
      })
    }
  }

  /**
   * Helper: Notify driver of delivery assignment
   */
  static async notifyDeliveryAssigned(deliveryId: string, driverId: string, orderNumber: string) {
    await this.createNotification({
      userId: driverId,
      title: "Delivery Assigned",
      message: `You have been assigned to delivery for order ${orderNumber}.`,
      type: "DELIVERY_ASSIGNED",
      relatedId: deliveryId,
      relatedType: "delivery",
    })
  }

  /**
   * Helper: Notify store of payment received
   */
  static async notifyPaymentReceived(invoiceId: string, invoiceNumber: string, amount: number, storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        users: {
          where: {
            role: {
              in: ["STORE_OWNER", "STORE_MANAGER"],
            },
            isActive: true,
          },
        },
      },
    })

    if (!store) return

    const userIds = store.users.map((u) => u.id)

    if (userIds.length > 0) {
      await this.createNotificationsForUsers(userIds, {
        title: "Payment Received",
        message: `Payment of $${amount.toFixed(2)} has been received for invoice ${invoiceNumber}.`,
        type: "PAYMENT_RECEIVED",
        relatedId: invoiceId,
        relatedType: "invoice",
      })
    }
  }

  /**
   * Helper: Notify store of invoice generation
   */
  static async notifyInvoiceGenerated(invoiceId: string, invoiceNumber: string, storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        users: {
          where: {
            role: {
              in: ["STORE_OWNER", "STORE_MANAGER"],
            },
            isActive: true,
          },
        },
      },
    })

    if (!store) return

    const userIds = store.users.map((u) => u.id)

    if (userIds.length > 0) {
      await this.createNotificationsForUsers(userIds, {
        title: "Invoice Generated",
        message: `Invoice ${invoiceNumber} has been generated for your order.`,
        type: "INVOICE_GENERATED",
        relatedId: invoiceId,
        relatedType: "invoice",
      })
    }
  }

  /**
   * Helper: Notify admins of low stock
   */
  static async notifyLowStock(productId: string, productName: string, storeId: string, currentLevel: number, threshold: number) {
    // Get all admins
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "ADMIN"],
        },
        isActive: true,
      },
      select: { id: true },
    })

    if (admins.length > 0) {
      const userIds = admins.map((u) => u.id)
      await this.createNotificationsForUsers(userIds, {
        title: "Low Stock Alert",
        message: `${productName} is running low at store ${storeId} (${currentLevel} units remaining, threshold: ${threshold}).`,
        type: "STOCK_LOW",
        relatedId: productId,
        relatedType: "product",
      })
    }
  }

  /**
   * Helper: Notify admins of temperature alert
   */
  static async notifyTemperatureAlert(
    temperatureLogId: string,
    temperature: number,
    location: string,
    storeId: string,
    deliveryId?: string
  ) {
    // Get all admins
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "ADMIN"],
        },
        isActive: true,
      },
      select: { id: true },
    })

    if (admins.length > 0) {
      const userIds = admins.map((u) => u.id)
      await this.createNotificationsForUsers(userIds, {
        title: "Temperature Alert",
        message: `Temperature out of range detected: ${temperature}°C at ${location} (Store: ${storeId}${deliveryId ? `, Delivery: ${deliveryId}` : ""}).`,
        type: "TEMPERATURE_ALERT",
        relatedId: temperatureLogId,
        relatedType: "temperature",
      })
    }
  }
}

