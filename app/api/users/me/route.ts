import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserService } from "@/lib/services/user.service"

// GET /api/users/me - Get current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await UserService.getUserById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json(
      { error: "Failed to get current user" },
      { status: 500 }
    )
  }
}

