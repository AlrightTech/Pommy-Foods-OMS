import { ReplenishmentService } from "@/lib/services/replenishment.service"

/**
 * Background job to check stock levels and generate draft orders
 * Should be run daily (e.g., via cron job or scheduled task)
 */
export async function checkAndGenerateDraftOrders(storeId?: string) {
  try {
    console.log(`Starting replenishment check${storeId ? ` for store ${storeId}` : " for all stores"}...`)
    
    const result = await ReplenishmentService.checkAndGenerateDraftOrders(storeId)
    
    console.log(`Replenishment check completed:`, {
      storesChecked: result.storesChecked,
      ordersGenerated: result.ordersGenerated,
    })
    
    return result
  } catch (error) {
    console.error("Error in replenishment check job:", error)
    throw error
  }
}

