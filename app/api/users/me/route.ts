import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { UserService } from "@/lib/services/user.service"

// GET /api/users/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const userData = await UserService.getUserById(user.id)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json(
      { error: "Failed to get current user" },
      { status: 500 }
    )
  }
}

