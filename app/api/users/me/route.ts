import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { UserService } from "@/lib/services/user.service"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
})

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

// PUT /api/users/me - Update current user
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Users can only update their own name and email
    const updatedUser = await UserService.updateUser(user.id, {
      name: validatedData.name,
      email: validatedData.email,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    )
  }
}

