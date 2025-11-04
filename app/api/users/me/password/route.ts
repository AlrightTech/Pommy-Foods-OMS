import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { UserService } from "@/lib/services/user.service"
import { z } from "zod"

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

// PUT /api/users/me/password - Update current user's password
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { currentPassword, newPassword } = updatePasswordSchema.parse(body)

    // Use UserService method to change password
    await UserService.changePassword(user.id, currentPassword, newPassword)

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update password" },
      { status: 500 }
    )
  }
}

