import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { sendPaymentReminders } from "@/lib/jobs/payment-reminders"

// POST /api/jobs/payment-reminders - Trigger payment reminders manually
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"])

    const result = await sendPaymentReminders()

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error running payment reminders:", error)
    return NextResponse.json(
      { error: "Failed to run payment reminders" },
      { status: 500 }
    )
  }
}

