import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { NotificationService } from "@/lib/services/notification.service"

// GET /api/notifications - List notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    
    const filters = {
      userId: user.id, // Always filter by current user
      isRead: searchParams.get("isRead") === "true" ? true : searchParams.get("isRead") === "false" ? false : undefined,
      type: searchParams.get("type") as any || undefined,
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    }

    const notifications = await NotificationService.listNotifications(filters)

    // Get unread count
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing notifications:", error)
    return NextResponse.json(
      { error: "Failed to list notifications" },
      { status: 500 }
    )
  }
}

