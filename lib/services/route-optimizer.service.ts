import { prisma } from "@/lib/prisma"

export interface DeliveryLocation {
  id: string
  latitude: number
  longitude: number
  address: string
  storeId: string
  priority?: "HIGH" | "MEDIUM" | "LOW"
}

/**
 * Basic route optimization using nearest neighbor algorithm
 * In production, this would integrate with a proper routing API (Google Maps Directions, Mapbox, etc.)
 */
export class RouteOptimizerService {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km

    return distance
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  /**
   * Optimize delivery route using nearest neighbor algorithm
   * @param deliveries Array of delivery locations
   * @param startLocation Optional starting location (driver's current location or depot)
   * @returns Optimized route order
   */
  static async optimizeRoute(
    deliveries: DeliveryLocation[],
    startLocation?: { latitude: number; longitude: number }
  ): Promise<DeliveryLocation[]> {
    if (deliveries.length === 0) {
      return []
    }

    if (deliveries.length === 1) {
      return deliveries
    }

    // If no start location provided, use first delivery as start
    const start = startLocation || {
      latitude: deliveries[0].latitude,
      longitude: deliveries[0].longitude,
    }

    const unvisited = [...deliveries]
    const route: DeliveryLocation[] = []
    let currentLocation = start

    // Nearest neighbor algorithm
    while (unvisited.length > 0) {
      let nearestIndex = 0
      let nearestDistance = Infinity

      // Find nearest unvisited delivery
      for (let i = 0; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          unvisited[i].latitude,
          unvisited[i].longitude
        )

        // Consider priority (HIGH priority deliveries prioritized)
        const priorityMultiplier =
          unvisited[i].priority === "HIGH" ? 0.5 : unvisited[i].priority === "MEDIUM" ? 0.75 : 1
        const adjustedDistance = distance * priorityMultiplier

        if (adjustedDistance < nearestDistance) {
          nearestDistance = adjustedDistance
          nearestIndex = i
        }
      }

      // Add nearest delivery to route
      const nearest = unvisited.splice(nearestIndex, 1)[0]
      route.push(nearest)
      currentLocation = {
        latitude: nearest.latitude,
        longitude: nearest.longitude,
      }
    }

    return route
  }

  /**
   * Get optimized route for driver's assigned deliveries
   */
  static async optimizeDriverRoute(
    driverId: string,
    startLocation?: { latitude: number; longitude: number }
  ) {
    // Get driver's assigned deliveries
    const deliveries = await prisma.delivery.findMany({
      where: {
        driverId,
        status: {
          in: ["ASSIGNED", "IN_TRANSIT"],
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    })

    if (deliveries.length === 0) {
      return []
    }

    // Map to DeliveryLocation format
    const locations: DeliveryLocation[] = deliveries
      .filter((d) => d.store.latitude && d.store.longitude)
      .map((delivery) => ({
        id: delivery.id,
        latitude: delivery.store.latitude!,
        longitude: delivery.store.longitude!,
        address: delivery.deliveryAddress,
        storeId: delivery.storeId,
        priority: "MEDIUM" as const,
      }))

    // Optimize route
    const optimizedRoute = await this.optimizeRoute(locations, startLocation)

    // Calculate total distance
    let totalDistance = 0
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      totalDistance += this.calculateDistance(
        optimizedRoute[i].latitude,
        optimizedRoute[i].longitude,
        optimizedRoute[i + 1].latitude,
        optimizedRoute[i + 1].longitude
      )
    }

    return {
      route: optimizedRoute,
      totalDistance, // in km
      estimatedTime: totalDistance * 2, // Assuming average 30km/h = 2 min/km
      deliveriesCount: optimizedRoute.length,
    }
  }

  /**
   * Calculate estimated time between two points (in minutes)
   * This is a simplified calculation - in production, use a routing API
   */
  static estimateTravelTime(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    averageSpeed: number = 30 // km/h
  ): number {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2)
    return (distance / averageSpeed) * 60 // Convert to minutes
  }
}

