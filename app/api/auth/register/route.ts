import { NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user.service"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "STORE_OWNER", "STORE_MANAGER", "KITCHEN_STAFF", "DRIVER"]),
  storeId: z.string().optional(),
})

// POST /api/auth/register - Public registration endpoint
// Note: In production, this might require admin approval or email verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Create user (will throw error if email exists)
    // Note: In production, you might want to set isActive to false
    // and require admin approval
    const user = await UserService.createUser({
      ...validatedData,
    })

    // UserService.createUser already excludes passwordHash in its select
    return NextResponse.json(
      {
        message: "Registration successful. Please contact admin for account activation.",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error registering user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register user" },
      { status: 500 }
    )
  }
}

