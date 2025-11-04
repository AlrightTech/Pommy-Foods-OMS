import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { UserService } from "@/lib/services/user.service"
import { z } from "zod"

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STORE_OWNER", "STORE_MANAGER", "KITCHEN_STAFF", "DRIVER"]),
  storeId: z.string().optional(),
})

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const { searchParams } = new URL(request.url)
    const filters = {
      role: searchParams.get("role") as any || undefined,
      storeId: searchParams.get("storeId") || undefined,
      isActive: searchParams.get("isActive") ? searchParams.get("isActive") === "true" : undefined,
      search: searchParams.get("search") || undefined,
    }

    const users = await UserService.listUsers(filters)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error listing users:", error)
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    )
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const user = await UserService.createUser({
      ...validatedData,
      createdById: authUser.id,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    )
  }
}

