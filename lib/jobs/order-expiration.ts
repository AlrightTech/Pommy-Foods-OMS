import { prisma } from "@/lib/prisma"

/**
 * Background job to cancel draft orders older than X days
 * Should be run daily
 */
export async function cancelExpiredDraftOrders(daysOld: number = 7) {
  try {
    console.log(`Starting expired draft order cleanup (older than ${daysOld} days)...`)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "DRAFT",
        orderType: "AUTO_REPLENISH",
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
      },
    })
    
    if (expiredOrders.length > 0) {
      await prisma.order.updateMany({
        where: {
          id: {
            in: expiredOrders.map((o) => o.id),
          },
        },
        data: {
          status: "CANCELLED",
        },
      })
    }
    
    console.log(`Expired draft order cleanup completed: ${expiredOrders.length} orders cancelled`)
    
    return {
      ordersCancelled: expiredOrders.length,
    }
  } catch (error) {
    console.error("Error in order expiration job:", error)
    throw error
  }
}

