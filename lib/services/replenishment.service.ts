import { prisma } from "@/lib/prisma"
import { OrderService } from "./order.service"

export interface ReplenishmentRule {
  productId: string
  storeId: string
  threshold: number
  reorderQuantity?: number // If not set, calculate based on consumption
}

export class ReplenishmentService {
  /**
   * Check stock levels and generate draft orders
   */
  static async checkAndGenerateDraftOrders(storeId?: string) {
    const generatedOrders = []

    // Get all active stores
    const where: any = { isActive: true }
    if (storeId) {
      where.id = storeId
    }

    const stores = await prisma.store.findMany({ where })

    for (const store of stores) {
      // Get all stock items for this store and filter low stock in application
      const allStockLevels = await prisma.storeStock.findMany({
        where: {
          storeId: store.id,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              shelfLife: true,
              isActive: true,
            },
          },
        },
      })

      // Filter low stock items (currentLevel <= threshold) and ensure shelfLife is included
      const stockLevels = allStockLevels.filter(
        (stock) => stock.currentLevel <= stock.threshold && stock.product.isActive
      )

      if (stockLevels.length === 0) {
        continue
      }

      // Check if there's already a draft order for this store today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const existingDraft = await prisma.order.findFirst({
        where: {
          storeId: store.id,
          status: "DRAFT",
          orderType: "AUTO_REPLENISH",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      })

      if (existingDraft) {
        // Update existing draft with new items
        const items = stockLevels.map((stock) => ({
          productId: stock.productId,
          quantity: this.calculateReorderQuantity({
            currentLevel: stock.currentLevel,
            threshold: stock.threshold,
            product: stock.product,
          }),
        }))

        try {
          await OrderService.updateOrderItems(existingDraft.id, { items })
          generatedOrders.push(existingDraft.id)
        } catch (error) {
          console.error(`Error updating draft order ${existingDraft.id}:`, error)
        }
      } else {
        // Create new draft order
        const items = stockLevels
          .filter((stock) => stock.product.isActive) // Only active products
          .map((stock) => ({
            productId: stock.productId,
            quantity: this.calculateReorderQuantity({
              currentLevel: stock.currentLevel,
              threshold: stock.threshold,
              product: stock.product,
            }),
          }))

        if (items.length > 0) {
          try {
            // Get or create a system user for auto-generated orders
            let systemUserId = await this.getOrCreateSystemUser()
            
            const order = await OrderService.createOrder({
              storeId: store.id,
              createdById: systemUserId,
              orderType: "AUTO_REPLENISH",
              items,
              notes: "Auto-generated replenishment order based on stock thresholds",
            })

            generatedOrders.push(order.id)
          } catch (error) {
            console.error(`Error creating draft order for store ${store.id}:`, error)
          }
        }
      }
    }

    return {
      storesChecked: stores.length,
      ordersGenerated: generatedOrders.length,
      orderIds: generatedOrders,
    }
  }

  /**
   * Calculate reorder quantity based on threshold and consumption pattern
   */
  private static calculateReorderQuantity(stock: {
    currentLevel: number
    threshold: number
    product?: { shelfLife: number | null } | null
  }): number {
    // Default: order 3x the threshold amount
    const baseReorderQuantity = stock.threshold * 3

    // Adjust based on shelf life (shorter shelf life = smaller orders)
    if (stock.product?.shelfLife) {
      if (stock.product.shelfLife < 7) {
        // Very short shelf life, order just above threshold
        return Math.max(stock.threshold + 5, baseReorderQuantity * 0.5)
      } else if (stock.product.shelfLife < 30) {
        // Short shelf life, moderate order
        return Math.max(stock.threshold * 2, baseReorderQuantity * 0.75)
      }
    }

    return baseReorderQuantity - stock.currentLevel // Order enough to reach base quantity
  }

  /**
   * Get or create a system user for auto-generated orders
   */
  private static async getOrCreateSystemUser(): Promise<string> {
    const systemEmail = "system@pommyfoods.com"

    let systemUser = await prisma.user.findUnique({
      where: { email: systemEmail },
      select: { id: true },
    })

    if (!systemUser) {
      // Create system user if it doesn't exist
      const bcrypt = await import("bcryptjs")
      const passwordHash = await bcrypt.hash(process.env.SYSTEM_USER_PASSWORD || "system-password-change-me", 10)

      const newUser = await prisma.user.create({
        data: {
          name: "System",
          email: systemEmail,
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
        select: { id: true },
      })

      systemUser = newUser
    }

    return systemUser.id
  }

  /**
   * Get replenishment rules for a store/product
   */
  static async getReplenishmentRules(storeId?: string, productId?: string) {
    const where: any = {}

    if (storeId) {
      where.storeId = storeId
    }

    if (productId) {
      where.productId = productId
    }

    const stockLevels = await prisma.storeStock.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
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

    return stockLevels.map((stock) => ({
      productId: stock.productId,
      storeId: stock.storeId,
      threshold: stock.threshold,
      currentLevel: stock.currentLevel,
      product: stock.product,
      store: stock.store,
    }))
  }

  /**
   * Update replenishment threshold
   */
  static async updateThreshold(storeId: string, productId: string, threshold: number) {
    return prisma.storeStock.upsert({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
      create: {
        storeId,
        productId,
        threshold,
        currentLevel: 0, // Default if creating new
      },
      update: {
        threshold,
      },
    })
  }
}

