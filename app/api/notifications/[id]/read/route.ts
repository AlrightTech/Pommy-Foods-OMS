import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { NotificationService } from "@/lib/services/notification.service"

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Verify notification belongs to user
    const notification = await NotificationService.getNotificationById(params.id)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await NotificationService.markAsRead(params.id)

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}

