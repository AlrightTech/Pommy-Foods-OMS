import { NextResponse } from "next/server"
import { ApiError } from "./api-error"

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  if (error instanceof Error) {
    // Handle known error types
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Log unexpected errors
    console.error("Unexpected error:", error)

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }

  // Unknown error type
  console.error("Unknown error:", error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}

/**
 * Success response helper
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Created response helper
 */
export function createdResponse(data: any) {
  return NextResponse.json(data, { status: 201 })
}

/**
 * No content response helper
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

