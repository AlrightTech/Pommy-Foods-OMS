import { TemperatureService } from "@/lib/services/temperature.service"
import { NotificationService } from "@/lib/services/notification.service"
import { prisma } from "@/lib/prisma"

/**
 * Background job to check recent temperature logs for compliance
 * Should be run every 5-10 minutes
 */
export async function checkTemperatureAlerts() {
  try {
    console.log("Starting temperature alert check...")
    
    // Get temperature logs from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const recentLogs = await prisma.temperatureLog.findMany({
      where: {
        recordedAt: {
          gte: oneHourAgo,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    let alertsGenerated = 0
    
    // Check each log for compliance
    for (const log of recentLogs) {
      const isCompliant = TemperatureService.isCompliant(
        log.temperature,
        log.location || ""
      )
      
      if (!isCompliant) {
        // Check if notification already exists for this log
        const existingNotification = await prisma.notification.findFirst({
          where: {
            relatedId: log.id,
            type: "TEMPERATURE_ALERT",
            createdAt: {
              gte: oneHourAgo,
            },
          },
        })
        
        if (!existingNotification) {
          // Generate alert notification
          try {
            await NotificationService.notifyTemperatureAlert(
              log.id,
              log.temperature,
              log.location || "",
              log.storeId,
              log.deliveryId || undefined
            )
            alertsGenerated++
          } catch (error) {
            console.error(`Error creating temperature alert for log ${log.id}:`, error)
          }
        }
      }
    }
    
    console.log(`Temperature alert check completed: ${alertsGenerated} new alerts generated`)
    
    return {
      logsChecked: recentLogs.length,
      alertsGenerated,
    }
  } catch (error) {
    console.error("Error in temperature alert check job:", error)
    throw error
  }
}

