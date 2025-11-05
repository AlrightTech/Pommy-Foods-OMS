import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/auth-helpers"
import { StoreService } from "@/lib/services/store.service"
import { z } from "zod"

const createStoreSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  creditLimit: z.number().nonnegative().optional(),
  paymentTerms: z.number().int().positive().optional(),
})

// GET /api/stores - List stores
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get("search") || undefined,
      region: searchParams.get("region") || undefined,
      city: searchParams.get("city") || undefined,
      isActive: searchParams.get("isActive") ? searchParams.get("isActive") === "true" : undefined,
    }

    const stores = await StoreService.listStores(filters)

    return NextResponse.json(stores)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing stores:", error)
    return NextResponse.json(
      { error: "Failed to list stores" },
      { status: 500 }
    )
  }
}

// POST /api/stores - Create store
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    const body = await request.json()
    const validatedData = createStoreSchema.parse(body)

    const store = await StoreService.createStore(validatedData)

    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating store:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create store" },
      { status: 500 }
    )
  }
}

