import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole, canAccessStore } from "@/lib/auth-helpers"
import { StoreService } from "@/lib/services/store.service"
import { z } from "zod"

const updateStoreSchema = z.object({
  name: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  creditLimit: z.number().nonnegative().optional(),
  paymentTerms: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/stores/[id] - Get store by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check if user can access this store
    if (!canAccessStore(user, params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const store = await StoreService.getStoreById(params.id)

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error getting store:", error)
    return NextResponse.json(
      { error: "Failed to get store" },
      { status: 500 }
    )
  }
}

// PUT /api/stores/[id] - Update store
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Only admins can update stores, or store owners can update limited fields
    const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN"

    if (!isAdmin && user.storeId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateStoreSchema.parse(body)

    // Store owners can only update certain fields
    if (!isAdmin && user.storeId === params.id) {
      const allowedFields = {
        contactName: validatedData.contactName,
        email: validatedData.email,
        phone: validatedData.phone,
      }
      const store = await StoreService.updateStore(params.id, allowedFields)
      return NextResponse.json(store)
    }

    // Admins can update all fields
    const store = await StoreService.updateStore(params.id, validatedData)
    return NextResponse.json(store)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating store:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update store" },
      { status: 500 }
    )
  }
}

// DELETE /api/stores/[id] - Delete store
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"], request)

    await StoreService.deleteStore(params.id)

    return NextResponse.json({ message: "Store deleted successfully" })
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    console.error("Error deleting store:", error)
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    )
  }
}

