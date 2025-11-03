import { prisma } from "@/lib/prisma"
import type { Prisma, KitchenSheetStatus } from "@prisma/client"

export interface CreateKitchenSheetInput {
  orderId: string
}

export interface UpdateKitchenSheetItemInput {
  batchNumber?: string
  expiryDate?: Date
  barcode?: string
  qrCode?: string
  isPacked?: boolean
}

export interface KitchenSheetFilters {
  status?: KitchenSheetStatus
  orderId?: string
  preparedBy?: string
}

export class KitchenService {
  /**
   * Generate kitchen sheet from approved order
   */
  static async generateKitchenSheet(orderId: string) {
    // Check if kitchen sheet already exists
    const existing = await prisma.kitchenSheet.findUnique({
      where: { orderId },
    })

    if (existing) {
      return existing
    }

    // Get approved order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "APPROVED") {
      throw new Error(`Cannot generate kitchen sheet for order with status ${order.status}`)
    }

    // Create kitchen sheet with items
    const kitchenSheet = await prisma.kitchenSheet.create({
      data: {
        orderId,
        status: "PENDING",
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
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
                shelfLife: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Update order status to KITCHEN_PREP
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "KITCHEN_PREP" },
    })

    return kitchenSheet
  }

  /**
   * Get kitchen sheet by ID
   */
  static async getKitchenSheetById(id: string) {
    return prisma.kitchenSheet.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                shelfLife: true,
                storageTempMin: true,
                storageTempMax: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            store: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * List kitchen sheets with optional filters
   */
  static async listKitchenSheets(filters?: KitchenSheetFilters) {
    const where: Prisma.KitchenSheetWhereInput = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.orderId) {
      where.orderId = filters.orderId
    }

    if (filters?.preparedBy) {
      where.preparedBy = filters.preparedBy
    }

    return prisma.kitchenSheet.findMany({
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Update kitchen sheet item
   */
  static async updateKitchenSheetItem(
    sheetId: string,
    itemId: string,
    data: UpdateKitchenSheetItemInput
  ) {
    // Verify item belongs to sheet
    const item = await prisma.kitchenSheetItem.findUnique({
      where: { id: itemId },
      include: {
        kitchenSheet: true,
      },
    })

    if (!item) {
      throw new Error("Kitchen sheet item not found")
    }

    if (item.kitchenSheetId !== sheetId) {
      throw new Error("Item does not belong to this kitchen sheet")
    }

    // Update item
    return prisma.kitchenSheetItem.update({
      where: { id: itemId },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    })
  }

  /**
   * Mark item as packed
   */
  static async markItemAsPacked(
    sheetId: string,
    itemId: string,
    batchNumber: string,
    expiryDate: Date,
    preparedBy?: string
  ) {
    // Generate barcode/QR code
    const barcode = await this.generateBarcode(itemId)
    const qrCode = await this.generateQRCode(itemId)

    // Update item
    await prisma.kitchenSheetItem.update({
      where: { id: itemId },
      data: {
        batchNumber,
        expiryDate,
        barcode,
        qrCode,
        isPacked: true,
      },
    })

    // Update sheet status if all items are packed
    await this.checkAndUpdateSheetStatus(sheetId)

    return { barcode, qrCode }
  }

  /**
   * Update kitchen sheet status
   */
  static async updateKitchenSheetStatus(
    id: string,
    status: KitchenSheetStatus,
    preparedBy?: string
  ) {
    const updateData: any = { status }

    if (status === "IN_PROGRESS" && preparedBy) {
      updateData.preparedBy = preparedBy
    }

    if (status === "COMPLETED") {
      updateData.completedAt = new Date()
    }

    const sheet = await prisma.kitchenSheet.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        order: true,
      },
    })

    // Update order status when kitchen sheet is completed
    if (status === "COMPLETED") {
      await prisma.order.update({
        where: { id: sheet.orderId },
        data: { status: "READY" },
      })
    }

    return sheet
  }

  /**
   * Check if all items are packed and update sheet status
   */
  private static async checkAndUpdateSheetStatus(sheetId: string) {
    const sheet = await prisma.kitchenSheet.findUnique({
      where: { id: sheetId },
      include: {
        items: true,
      },
    })

    if (!sheet) {
      return
    }

    const allPacked = sheet.items.every((item) => item.isPacked)

    if (allPacked && sheet.items.length > 0) {
      await prisma.kitchenSheet.update({
        where: { id: sheetId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      })

      // Update order status
      await prisma.order.update({
        where: { id: sheet.orderId },
        data: { status: "READY" },
      })
    }
  }

  /**
   * Generate barcode for item
   */
  private static async generateBarcode(itemId: string): Promise<string> {
    // In production, use a barcode generation library
    // For now, generate a simple alphanumeric code
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `BC-${timestamp}-${random}`
  }

  /**
   * Generate QR code for item
   */
  private static async generateQRCode(itemId: string): Promise<string> {
    // In production, use a QR code generation library (e.g., qrcode)
    // For now, generate a data URL or use a service
    const item = await prisma.kitchenSheetItem.findUnique({
      where: { id: itemId },
      include: {
        kitchenSheet: {
          include: {
            order: true,
          },
        },
        product: true,
      },
    })

    if (!item) {
      throw new Error("Item not found")
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      itemId: item.id,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      productId: item.productId,
      productSku: item.product.sku,
      orderNumber: item.kitchenSheet.order.orderNumber,
    })

    // In production, encode as QR code image
    // For now, return the data (frontend will generate QR code)
    return qrData
  }

  /**
   * Auto-generate kitchen sheets for all approved orders without sheets
   */
  static async autoGenerateKitchenSheets() {
    const approvedOrders = await prisma.order.findMany({
      where: {
        status: "APPROVED",
        kitchenSheet: null,
      },
      select: {
        id: true,
      },
    })

    const generated = []

    for (const order of approvedOrders) {
      try {
        const sheet = await this.generateKitchenSheet(order.id)
        generated.push(sheet.id)
      } catch (error) {
        console.error(`Error generating kitchen sheet for order ${order.id}:`, error)
      }
    }

    return {
      ordersProcessed: approvedOrders.length,
      sheetsGenerated: generated.length,
      sheetIds: generated,
    }
  }
}

