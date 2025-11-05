import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { checkTemperatureAlerts } from "@/lib/jobs/temperature-alert-check"

// POST /api/jobs/temperature-alert - Trigger temperature alert check manually
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const result = await checkTemperatureAlerts()

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error running temperature alert check:", error)
    return NextResponse.json(
      { error: "Failed to run temperature alert check" },
      { status: 500 }
    )
  }
}

