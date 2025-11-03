import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface CreateProductInput {
  name: string
  sku: string
  description?: string
  price: number
  unit?: string
  category?: string
  shelfLife: number
  storageTempMin?: number
  storageTempMax?: number
}

export interface UpdateProductInput {
  name?: string
  sku?: string
  description?: string
  price?: number
  unit?: string
  category?: string
  shelfLife?: number
  storageTempMin?: number
  storageTempMax?: number
  isActive?: boolean
}

export interface ProductFilters {
  search?: string
  category?: string
  isActive?: boolean
}

export class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductInput) {
    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existingProduct) {
      throw new Error("Product with this SKU already exists")
    }

    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: data.price,
        unit: data.unit || "unit",
        category: data.category,
        shelfLife: data.shelfLife,
        storageTempMin: data.storageTempMin,
        storageTempMax: data.storageTempMax,
      },
    })
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    })
  }

  /**
   * Get product by SKU
   */
  static async getProductBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    })
  }

  /**
   * List products with optional filters
   */
  static async listProducts(filters?: ProductFilters) {
    const where: Prisma.ProductWhereInput = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    return prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: UpdateProductInput) {
    // If SKU is being updated, check for conflicts
    if (data.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: data.sku },
      })

      if (existingProduct && existingProduct.id !== id) {
        throw new Error("Product with this SKU already exists")
      }
    }

    return prisma.product.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete product (soft delete by deactivating)
   */
  static async deleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * Get product categories
   */
  static async getCategories() {
    const products = await prisma.product.findMany({
      where: {
        category: { not: null },
        isActive: true,
      },
      select: { category: true },
      distinct: ["category"],
    })

    return products
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null)
      .sort()
  }
}

