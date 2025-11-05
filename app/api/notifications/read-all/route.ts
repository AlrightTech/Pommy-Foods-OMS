import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { NotificationService } from "@/lib/services/notification.service"

// PUT /api/notifications/read-all - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const result = await NotificationService.markAllAsRead(user.id)

    return NextResponse.json({
      message: "All notifications marked as read",
      updated: result.count,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    )
  }
}

