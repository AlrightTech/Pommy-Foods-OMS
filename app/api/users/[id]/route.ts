import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/auth-helpers"
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
    const authUser = await requireAuth(request)

    // Users can view themselves, or admins can view anyone
    if (authUser.id !== params.id && authUser.role !== "SUPER_ADMIN" && authUser.role !== "ADMIN") {
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
    const authUser = await requireAuth(request)

    // Users can update themselves (limited fields), or admins can update anyone
    const isOwnAccount = authUser.id === params.id
    const isAdmin = authUser.role === "SUPER_ADMIN" || authUser.role === "ADMIN"

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
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const authUser = await requireAuth(request)

    // Prevent self-deletion
    if (authUser.id === params.id) {
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

