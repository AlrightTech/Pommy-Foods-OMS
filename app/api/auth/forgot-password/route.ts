import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
// Note: In production, you would use a service like Resend, SendGrid, or Nodemailer
// For now, we'll just return success (email sending would be implemented here)

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // Always return success to prevent email enumeration
    // In production, you would:
    // 1. Generate a reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link
    // 4. Return success regardless of whether user exists

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error processing forgot password:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

