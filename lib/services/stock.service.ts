import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface UpdateStockInput {
  storeId: string
  productId: string
  currentLevel: number
  threshold?: number
}

export interface BulkUpdateStockInput {
  storeId: string
  updates: Array<{
    productId: string
    currentLevel: number
    threshold?: number
  }>
}

export interface StockFilters {
  storeId?: string
  productId?: string
  lowStock?: boolean
  search?: string
}

export class StockService {
  /**
   * Update stock level for a store product
   */
  static async updateStock(data: UpdateStockInput, updatedBy?: string) {
    const stock = await prisma.storeStock.upsert({
      where: {
        storeId_productId: {
          storeId: data.storeId,
          productId: data.productId,
        },
      },
      create: {
        storeId: data.storeId,
        productId: data.productId,
        currentLevel: data.currentLevel,
        threshold: data.threshold || 10,
        updatedBy,
      },
      update: {
        currentLevel: data.currentLevel,
        threshold: data.threshold,
        lastUpdated: new Date(),
        updatedBy,
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

    // Check if stock is low and send notification
    if (stock.currentLevel <= stock.threshold) {
      try {
        const { NotificationService } = await import("./notification.service")
        await NotificationService.notifyLowStock(
          data.productId,
          stock.product.name,
          data.storeId,
          stock.currentLevel,
          stock.threshold
        )
      } catch (error) {
        console.error("Error sending low stock notification:", error)
      }
    }

    return stock
  }

  /**
   * Bulk update stock levels
   */
  static async bulkUpdateStock(data: BulkUpdateStockInput, updatedBy?: string) {
    const results = []

    for (const update of data.updates) {
      const result = await this.updateStock(
        {
          storeId: data.storeId,
          productId: update.productId,
          currentLevel: update.currentLevel,
          threshold: update.threshold,
        },
        updatedBy
      )
      results.push(result)
    }

    return results
  }

  /**
   * Get stock level for a specific store product
   */
  static async getStock(storeId: string, productId: string) {
    return prisma.storeStock.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
      include: {
        product: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  /**
   * List stock levels with optional filters
   */
  static async listStock(filters?: StockFilters) {
    const where: Prisma.StoreStockWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.productId) {
      where.productId = filters.productId
    }

    // Note: lowStock filtering is done in application layer
    // Prisma doesn't support comparing fields directly in where clause

    if (filters?.search) {
      where.product = {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { sku: { contains: filters.search, mode: "insensitive" } },
        ],
      }
    }

    const results = await prisma.storeStock.findMany({
      where,
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
        store: {
          select: {
            id: true,
            name: true,
            region: true,
            city: true,
          },
        },
      },
      orderBy: [
        { store: { name: "asc" } },
        { product: { name: "asc" } },
      ],
    })

    // Filter low stock items if requested
    if (filters?.lowStock) {
      return results.filter((stock) => stock.currentLevel <= stock.threshold)
    }

    return results
  }

  /**
   * Get low stock items across all stores or a specific store
   */
  static async getLowStockItems(storeId?: string) {
    const where: Prisma.StoreStockWhereInput = {}

    if (storeId) {
      where.storeId = storeId
    }

    // Get all stock levels first, then filter in application
    // (Prisma doesn't support comparing fields directly in where clause easily)
    const allStock = await prisma.storeStock.findMany({
      where,
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
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Filter items where currentLevel <= threshold
    return allStock.filter((stock) => stock.currentLevel <= stock.threshold)
  }

  /**
   * Update threshold for a store product
   */
  static async updateThreshold(storeId: string, productId: string, threshold: number) {
    return prisma.storeStock.update({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
      data: { threshold },
    })
  }

  /**
   * Get stock history (using raw query for aggregation)
   * Note: This assumes a stock history table exists, or we track via orders
   */
  static async getStockHistory(storeId: string, productId: string, days: number = 30) {
    // This would require a stock history/audit table
    // For now, return empty array - can be implemented later
    return []
  }
}

