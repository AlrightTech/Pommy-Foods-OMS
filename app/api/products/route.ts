import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { ProductService } from "@/lib/services/product.service"
import { z } from "zod"

const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  unit: z.string().optional(),
  category: z.string().optional(),
  shelfLife: z.number().int().positive(),
  storageTempMin: z.number().optional(),
  storageTempMax: z.number().optional(),
})

// GET /api/products - List products
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      isActive: searchParams.get("isActive") ? searchParams.get("isActive") === "true" : undefined,
    }

    const products = await ProductService.listProducts(filters)

    return NextResponse.json(products)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Error listing products:", error)
    return NextResponse.json(
      { error: "Failed to list products" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create product
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admins can create products
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    const product = await ProductService.createProduct(validatedData)

    return NextResponse.json(product, { status: 201 })
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

    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    )
  }
}

