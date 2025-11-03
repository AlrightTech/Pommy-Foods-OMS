import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface SalesReportFilters {
  storeId?: string
  productId?: string
  startDate?: Date
  endDate?: Date
  groupBy?: "day" | "week" | "month" | "year"
}

export interface StockInsightFilters {
  storeId?: string
  productId?: string
  lowStockOnly?: boolean
}

export interface DeliveryMetricsFilters {
  driverId?: string
  storeId?: string
  startDate?: Date
  endDate?: Date
}

export class AnalyticsService {
  /**
   * Get sales reports
   */
  static async getSalesReport(filters?: SalesReportFilters) {
    const where: Prisma.OrderWhereInput = {
      status: {
        in: ["DELIVERED", "COMPLETED"],
      },
    }

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.startDate || filters?.endDate) {
      where.delivery = {
        deliveredAt: {},
      }
      if (filters.startDate) {
        where.delivery.deliveredAt = {
          ...(where.delivery.deliveredAt as any),
          gte: filters.startDate,
        }
      }
      if (filters.endDate) {
        where.delivery.deliveredAt = {
          ...(where.delivery.deliveredAt as any),
          lte: filters.endDate,
        }
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                price: true,
              },
            },
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
        delivery: {
          select: {
            deliveredAt: true,
          },
        },
      },
    })

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const totalOrders = orders.length

    // Group by product
    const byProduct = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const key = item.productId
        if (!acc[key]) {
          acc[key] = {
            product: item.product,
            quantity: 0,
            revenue: 0,
            orders: new Set(),
          }
        }
        acc[key].quantity += item.quantity
        acc[key].revenue += Number(item.totalPrice)
        acc[key].orders.add(order.id)
      })
      return acc
    }, {} as Record<string, { product: any; quantity: number; revenue: number; orders: Set<string> }>)

    // Group by store
    const byStore = orders.reduce((acc, order) => {
      const key = order.storeId
      if (!acc[key]) {
        acc[key] = {
          store: order.store,
          revenue: 0,
          orders: 0,
        }
      }
      acc[key].revenue += Number(order.totalAmount)
      acc[key].orders++
      return acc
    }, {} as Record<string, { store: any; revenue: number; orders: number }>)

    // Group by region
    const byRegion = orders.reduce((acc, order) => {
      const region = order.store.region
      if (!acc[region]) {
        acc[region] = { revenue: 0, orders: 0 }
      }
      acc[region].revenue += Number(order.totalAmount)
      acc[region].orders++
      return acc
    }, {} as Record<string, { revenue: number; orders: number }>)

    // Time series data
    const timeSeries = orders.reduce((acc, order) => {
      if (!order.delivery?.deliveredAt) return acc

      const date = new Date(order.delivery.deliveredAt)
      let key: string

      if (filters?.groupBy === "week") {
        const week = getWeek(date)
        key = `${date.getFullYear()}-W${week}`
      } else if (filters?.groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (filters?.groupBy === "year") {
        key = String(date.getFullYear())
      } else {
        // day
        key = date.toISOString().split("T")[0]
      }

      if (!acc[key]) {
        acc[key] = { date: key, revenue: 0, orders: 0 }
      }
      acc[key].revenue += Number(order.totalAmount)
      acc[key].orders++

      return acc
    }, {} as Record<string, { date: string; revenue: number; orders: number }>)

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      byProduct: Object.values(byProduct).map((item) => ({
        ...item,
        orders: item.orders.size,
      })),
      byStore: Object.values(byStore),
      byRegion: Object.entries(byRegion).map(([region, data]) => ({
        region,
        ...data,
      })),
      timeSeries: Object.values(timeSeries).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    }
  }

  /**
   * Get stock insights
   */
  static async getStockInsights(filters?: StockInsightFilters) {
    const where: Prisma.StoreStockWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.productId) {
      where.productId = filters.productId
    }

    const stockLevels = await prisma.storeStock.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            price: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
    })

    // Calculate insights
    const totalProducts = stockLevels.length
    const lowStockItems = stockLevels.filter(
      (stock) => stock.currentLevel <= stock.threshold
    )
    const outOfStockItems = stockLevels.filter((stock) => stock.currentLevel === 0)

    // Total stock value
    const totalStockValue = stockLevels.reduce(
      (sum, stock) => sum + Number(stock.product.price) * stock.currentLevel,
      0
    )

    // Value of low stock items
    const lowStockValue = lowStockItems.reduce(
      (sum, stock) => sum + Number(stock.product.price) * stock.currentLevel,
      0
    )

    // Group by product category
    const byCategory = stockLevels.reduce((acc, stock) => {
      const category = stock.product.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = {
          category,
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
        }
      }
      acc[category].totalProducts++
      acc[category].totalValue += Number(stock.product.price) * stock.currentLevel
      if (stock.currentLevel <= stock.threshold) {
        acc[category].lowStockCount++
      }
      return acc
    }, {} as Record<string, { category: string; totalProducts: number; totalValue: number; lowStockCount: number }>)

    // Group by store
    const byStore = stockLevels.reduce((acc, stock) => {
      const key = stock.storeId
      if (!acc[key]) {
        acc[key] = {
          store: stock.store,
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
        }
      }
      acc[key].totalProducts++
      acc[key].totalValue += Number(stock.product.price) * stock.currentLevel
      if (stock.currentLevel <= stock.threshold) {
        acc[key].lowStockCount++
      }
      return acc
    }, {} as Record<string, { store: any; totalProducts: number; totalValue: number; lowStockCount: number }>)

    return {
      totalProducts,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalStockValue,
      lowStockValue,
      byCategory: Object.values(byCategory),
      byStore: Object.values(byStore),
      lowStockItems: lowStockItems.slice(0, 20), // Top 20 low stock items
    }
  }

  /**
   * Get delivery performance metrics
   */
  static async getDeliveryMetrics(filters?: DeliveryMetricsFilters) {
    const where: Prisma.DeliveryWhereInput = {}

    if (filters?.driverId) {
      where.driverId = filters.driverId
    }

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledDate = {}
      if (filters.startDate) {
        where.scheduledDate.gte = filters.startDate
      }
      if (filters.endDate) {
        where.scheduledDate.lte = filters.endDate
      }
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
    })

    const total = deliveries.length
    const delivered = deliveries.filter((d) => d.status === "DELIVERED").length
    const inTransit = deliveries.filter((d) => d.status === "IN_TRANSIT").length
    const pending = deliveries.filter((d) => d.status === "PENDING" || d.status === "ASSIGNED").length
    const failed = deliveries.filter((d) => d.status === "FAILED").length

    // On-time delivery rate (delivered within scheduled date)
    const onTimeDeliveries = deliveries.filter((d) => {
      if (d.status !== "DELIVERED" || !d.deliveredAt) return false
      const scheduled = new Date(d.scheduledDate)
      const delivered = new Date(d.deliveredAt)
      return delivered <= scheduled || delivered.getDate() === scheduled.getDate()
    }).length

    // Average delivery time (for completed deliveries)
    const completedDeliveries = deliveries.filter(
      (d) => d.status === "DELIVERED" && d.deliveredAt && d.createdAt
    )

    const avgDeliveryTime = completedDeliveries.length > 0
      ? completedDeliveries.reduce((sum, d) => {
          const created = new Date(d.createdAt)
          const delivered = new Date(d.deliveredAt!)
          return sum + (delivered.getTime() - created.getTime()) / (1000 * 60 * 60) // hours
        }, 0) / completedDeliveries.length
      : 0

    // By driver
    const byDriver = deliveries.reduce((acc, d) => {
      if (!d.driverId) return acc
      const key = d.driverId
      if (!acc[key]) {
        acc[key] = {
          driver: d.driver,
          total: 0,
          delivered: 0,
          onTime: 0,
        }
      }
      acc[key].total++
      if (d.status === "DELIVERED") {
        acc[key].delivered++
      }
      if (d.status === "DELIVERED" && d.deliveredAt) {
        const scheduled = new Date(d.scheduledDate)
        const delivered = new Date(d.deliveredAt)
        if (delivered <= scheduled || delivered.getDate() === scheduled.getDate()) {
          acc[key].onTime++
        }
      }
      return acc
    }, {} as Record<string, { driver: any; total: number; delivered: number; onTime: number }>)

    // By store
    const byStore = deliveries.reduce((acc, d) => {
      const key = d.storeId
      if (!acc[key]) {
        acc[key] = {
          store: d.store,
          total: 0,
          delivered: 0,
        }
      }
      acc[key].total++
      if (d.status === "DELIVERED") {
        acc[key].delivered++
      }
      return acc
    }, {} as Record<string, { store: any; total: number; delivered: number }>)

    return {
      total,
      delivered,
      inTransit,
      pending,
      failed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      onTimeRate: delivered > 0 ? (onTimeDeliveries / delivered) * 100 : 0,
      averageDeliveryTime: avgDeliveryTime,
      byDriver: Object.values(byDriver),
      byStore: Object.values(byStore),
    }
  }

  /**
   * Get returns/wastage reports
   */
  static async getReturnsReport(filters?: {
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
                category: true,
                price: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
    })

    // Calculate totals
    const totalReturns = returns.length
    const totalQuantity = returns.reduce(
      (sum, ret) => sum + ret.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    )
    const totalValue = returns.reduce((sum, ret) => {
      return (
        sum +
        ret.items.reduce(
          (itemSum, item) => itemSum + Number(item.product.price) * item.quantity,
          0
        )
      )
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
            returns: 0,
          }
        }
        acc[key].quantity += item.quantity
        acc[key].value += Number(item.product.price) * item.quantity
        acc[key].returns++
      })
      return acc
    }, {} as Record<string, { product: any; quantity: number; value: number; returns: number }>)

    // Group by store
    const byStore = returns.reduce((acc, ret) => {
      const key = ret.storeId
      if (!acc[key]) {
        acc[key] = {
          store: ret.store,
          returns: 0,
          quantity: 0,
          value: 0,
        }
      }
      acc[key].returns++
      acc[key].quantity += ret.items.reduce((sum, item) => sum + item.quantity, 0)
      acc[key].value += ret.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      )
      return acc
    }, {} as Record<string, { store: any; returns: number; quantity: number; value: number }>)

    // Group by reason
    const byReason = returns.reduce((acc, ret) => {
      ret.items.forEach((item) => {
        const reason = item.reason || "other"
        if (!acc[reason]) {
          acc[reason] = { reason, quantity: 0, value: 0 }
        }
        acc[reason].quantity += item.quantity
        acc[reason].value += Number(item.product.price) * item.quantity
      })
      return acc
    }, {} as Record<string, { reason: string; quantity: number; value: number }>)

    return {
      totalReturns,
      totalQuantity,
      totalValue,
      averageReturnValue: totalReturns > 0 ? totalValue / totalReturns : 0,
      byProduct: Object.values(byProduct),
      byStore: Object.values(byStore),
      byReason: Object.values(byReason),
    }
  }

  /**
   * Get payment reports
   */
  static async getPaymentReport(filters?: {
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
            id: true,
            invoiceNumber: true,
            store: {
              select: {
                id: true,
                name: true,
                region: true,
              },
            },
          },
        },
      },
    })

    const totalPayments = payments.length
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Group by payment method
    const byMethod = payments.reduce((acc, p) => {
      const method = p.paymentMethod
      if (!acc[method]) {
        acc[method] = { method, count: 0, amount: 0 }
      }
      acc[method].count++
      acc[method].amount += Number(p.amount)
      return acc
    }, {} as Record<string, { method: string; count: number; amount: number }>)

    // Group by store
    const byStore = payments.reduce((acc, p) => {
      const storeId = p.invoice.store.id
      if (!acc[storeId]) {
        acc[storeId] = {
          store: p.invoice.store,
          count: 0,
          amount: 0,
        }
      }
      acc[storeId].count++
      acc[storeId].amount += Number(p.amount)
      return acc
    }, {} as Record<string, { store: any; count: number; amount: number }>)

    // Time series
    const timeSeries = payments.reduce((acc, p) => {
      const date = new Date(p.paymentDate)
      const key = date.toISOString().split("T")[0]

      if (!acc[key]) {
        acc[key] = { date: key, count: 0, amount: 0 }
      }
      acc[key].count++
      acc[key].amount += Number(p.amount)

      return acc
    }, {} as Record<string, { date: string; count: number; amount: number }>)

    return {
      totalPayments,
      totalAmount,
      averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0,
      byMethod: Object.values(byMethod),
      byStore: Object.values(byStore),
      timeSeries: Object.values(timeSeries).sort((a, b) => a.date.localeCompare(b.date)),
    }
  }
}

// Helper function to get week number
function getWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

