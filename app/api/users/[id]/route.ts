import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserService } from "@/lib/services/user.service"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STORE_OWNER", "STORE_MANAGER", "KITCHEN_STAFF", "DRIVER"]).optional(),
  storeId: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can view themselves, or admins can view anyone
    if (session.user.id !== params.id && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await UserService.getUserById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can update themselves (limited fields), or admins can update anyone
    const isOwnAccount = session.user.id === params.id
    const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"

    if (!isOwnAccount && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Non-admins can only update their own name and password
    if (isOwnAccount && !isAdmin) {
      const allowedFields = { name: validatedData.name, password: validatedData.password }
      const user = await UserService.updateUser(params.id, allowedFields)
      return NextResponse.json(user)
    }

    // Admins can update all fields
    const user = await UserService.updateUser(params.id, validatedData)
    return NextResponse.json(user)
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

// DELETE /api/users/[id] - Delete user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can delete users
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    await UserService.deleteUser(params.id)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}

