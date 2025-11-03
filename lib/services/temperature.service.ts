import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface CreateTemperatureLogInput {
  deliveryId?: string
  storeId: string
  temperature: number
  location: string
  recordedBy?: string
  isManual?: boolean
  sensorId?: string
  notes?: string
}

export interface TemperatureFilters {
  deliveryId?: string
  storeId?: string
  location?: string
  startDate?: Date
  endDate?: Date
  compliant?: boolean // Filter by compliance
}

export interface TemperatureRange {
  min: number
  max: number
}

const TEMPERATURE_RANGES: Record<string, TemperatureRange> = {
  fridge: { min: 2, max: 8 },
  freezer: { min: -18, max: -12 },
  ambient: { min: 15, max: 25 },
  vehicle: { min: 2, max: 8 },
}

export class TemperatureService {
  /**
   * Check if temperature is within acceptable range
   */
  static isCompliant(temperature: number, location: string): boolean {
    const range = TEMPERATURE_RANGES[location]
    if (!range) {
      return true // Unknown locations are considered compliant
    }
    return temperature >= range.min && temperature <= range.max
  }

  /**
   * Get temperature range for location
   */
  static getTemperatureRange(location: string): TemperatureRange | null {
    return TEMPERATURE_RANGES[location] || null
  }

  /**
   * Create temperature log
   */
  static async createTemperatureLog(data: CreateTemperatureLogInput) {
    // Check compliance
    const isCompliant = this.isCompliant(data.temperature, data.location)

    const log = await prisma.temperatureLog.create({
      data: {
        deliveryId: data.deliveryId,
        storeId: data.storeId,
        temperature: data.temperature,
        location: data.location,
        recordedBy: data.recordedBy,
        isManual: data.isManual ?? true,
        sensorId: data.sensorId,
        notes: data.notes,
      },
    })

    // If non-compliant, create alert notification
    if (!isCompliant) {
      try {
        const { NotificationService } = await import("./notification.service")
        await NotificationService.notifyTemperatureAlert(
          log.id,
          data.temperature,
          data.location,
          data.storeId,
          data.deliveryId
        )
      } catch (error) {
        console.error("Error sending temperature alert notification:", error)
      }
    }

    return {
      ...log,
      isCompliant,
      range: this.getTemperatureRange(data.location),
    }
  }

  /**
   * Get temperature log by ID
   */
  static async getTemperatureLogById(id: string) {
    const log = await prisma.temperatureLog.findUnique({
      where: { id },
      include: {
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                orderNumber: true,
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
    })

    if (!log) {
      return null
    }

    const isCompliant = this.isCompliant(log.temperature, log.location || "")
    const range = this.getTemperatureRange(log.location || "")

    return {
      ...log,
      isCompliant,
      range,
    }
  }

  /**
   * List temperature logs with optional filters
   */
  static async listTemperatureLogs(filters?: TemperatureFilters) {
    const where: Prisma.TemperatureLogWhereInput = {}

    if (filters?.deliveryId) {
      where.deliveryId = filters.deliveryId
    }

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.location) {
      where.location = filters.location
    }

    if (filters?.startDate || filters?.endDate) {
      where.recordedAt = {}
      if (filters.startDate) {
        where.recordedAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.recordedAt.lte = filters.endDate
      }
    }

    const logs = await prisma.temperatureLog.findMany({
      where,
      include: {
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                orderNumber: true,
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
      orderBy: { recordedAt: "desc" },
    })

    // Add compliance status to each log
    return logs.map((log) => {
      const isCompliant = this.isCompliant(log.temperature, log.location || "")
      const range = this.getTemperatureRange(log.location || "")
      return {
        ...log,
        isCompliant,
        range,
      }
    })
  }

  /**
   * Get compliance statistics
   */
  static async getComplianceStatistics(filters?: {
    storeId?: string
    startDate?: Date
    endDate?: Date
    location?: string
  }) {
    const where: Prisma.TemperatureLogWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.location) {
      where.location = filters.location
    }

    if (filters?.startDate || filters?.endDate) {
      where.recordedAt = {}
      if (filters.startDate) {
        where.recordedAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.recordedAt.lte = filters.endDate
      }
    }

    const logs = await prisma.temperatureLog.findMany({
      where,
      select: {
        temperature: true,
        location: true,
        recordedAt: true,
      },
    })

    // Calculate compliance
    const total = logs.length
    const compliant = logs.filter((log) =>
      this.isCompliant(log.temperature, log.location || "")
    ).length
    const nonCompliant = total - compliant

    // Group by location
    const byLocation = logs.reduce((acc, log) => {
      const location = log.location || "unknown"
      if (!acc[location]) {
        acc[location] = { total: 0, compliant: 0, nonCompliant: 0 }
      }
      acc[location].total++
      if (this.isCompliant(log.temperature, location)) {
        acc[location].compliant++
      } else {
        acc[location].nonCompliant++
      }
      return acc
    }, {} as Record<string, { total: number; compliant: number; nonCompliant: number }>)

    // Temperature trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentLogs = logs.filter(
      (log) => log.recordedAt >= thirtyDaysAgo
    )

    const avgTemperature =
      recentLogs.length > 0
        ? recentLogs.reduce((sum, log) => sum + log.temperature, 0) /
          recentLogs.length
        : 0

    return {
      total,
      compliant,
      nonCompliant,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
      byLocation,
      averageTemperature: avgTemperature,
      recentLogsCount: recentLogs.length,
    }
  }

  /**
   * Get non-compliant logs (alerts)
   */
  static async getNonCompliantLogs(filters?: {
    storeId?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: Prisma.TemperatureLogWhereInput = {}

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.startDate || filters?.endDate) {
      where.recordedAt = {}
      if (filters.startDate) {
        where.recordedAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.recordedAt.lte = filters.endDate
      }
    }

    const logs = await prisma.temperatureLog.findMany({
      where,
      include: {
        delivery: {
          select: {
            id: true,
            order: {
              select: {
                orderNumber: true,
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
      orderBy: { recordedAt: "desc" },
    })

    // Filter to only non-compliant
    return logs
      .filter((log) => !this.isCompliant(log.temperature, log.location || ""))
      .map((log) => {
        const range = this.getTemperatureRange(log.location || "")
        return {
          ...log,
          isCompliant: false,
          range,
        }
      })
  }
}

