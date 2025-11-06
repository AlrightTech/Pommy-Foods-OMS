import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/driver/stats - Get driver statistics
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Only drivers can access this endpoint
    if (user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's deliveries
    const todayDeliveries = await prisma.delivery.findMany({
      where: {
        driverId: user.id,
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Get completed deliveries count
    const completedCount = await prisma.delivery.count({
      where: {
        driverId: user.id,
        status: "DELIVERED",
      },
    })

    // Get in-progress deliveries
    const inProgressCount = await prisma.delivery.count({
      where: {
        driverId: user.id,
        status: "IN_TRANSIT",
      },
    })

    // Get assigned but not started
    const assignedCount = await prisma.delivery.count({
      where: {
        driverId: user.id,
        status: "ASSIGNED",
      },
    })

    // Get total earnings (from cash payments collected)
    const totalEarnings = await prisma.payment.aggregate({
      where: {
        collectedBy: user.id,
        paymentMethod: "CASH",
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      todayDeliveries: todayDeliveries.length,
      completedDeliveries: completedCount,
      inProgressDeliveries: inProgressCount,
      assignedDeliveries: assignedCount,
      totalEarnings: Number(totalEarnings._sum.amount || 0),
      nextDelivery: todayDeliveries.find((d) => d.status === "ASSIGNED" || d.status === "PENDING") || null,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting driver stats:", error)
    return NextResponse.json(
      { error: "Failed to get driver stats" },
      { status: 500 }
    )
  }
}

