import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { Store } from "@prisma/client"

export interface CreateStoreInput {
  name: string
  contactName: string
  email?: string
  phone: string
  address: string
  city: string
  region: string
  latitude?: number | null
  longitude?: number | null
  creditLimit?: number | null
  paymentTerms?: number | null
}

export interface UpdateStoreInput {
  name?: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  creditLimit?: number
  paymentTerms?: number
  isActive?: boolean
}

export interface StoreFilters {
  region?: string
  city?: string
  isActive?: boolean
  search?: string
}

export class StoreService {
  /**
   * Create a new store
   */
  static async createStore(data: CreateStoreInput) {
    return prisma.store.create({
      data: {
        name: data.name,
        contactName: data.contactName,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        city: data.city,
        region: data.region,
        ...(data.latitude !== undefined && data.latitude !== null && { latitude: data.latitude }),
        ...(data.longitude !== undefined && data.longitude !== null && { longitude: data.longitude }),
        ...(data.creditLimit !== undefined && data.creditLimit !== null && { creditLimit: data.creditLimit }),
        ...(data.paymentTerms !== undefined && data.paymentTerms !== null && { paymentTerms: data.paymentTerms }),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Get store by ID
   */
  static async getStoreById(id: string) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * List stores with optional filters
   */
  static async listStores(filters?: StoreFilters) {
    const where: Prisma.StoreWhereInput = {}

    if (filters?.region) {
      where.region = filters.region
    }

    if (filters?.city) {
      where.city = filters.city
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { contactName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    return prisma.store.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })
  }

  /**
   * Update store
   */
  static async updateStore(id: string, data: UpdateStoreInput) {
    return prisma.store.update({
      where: { id },
      data,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Delete store (soft delete)
   */
  static async deleteStore(id: string) {
    return prisma.store.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * Get store statistics
   */
  static async getStoreStats(storeId: string) {
    const [orders, invoices, stock] = await Promise.all([
      prisma.order.count({
        where: { storeId },
      }),
      prisma.invoice.count({
        where: { storeId },
      }),
      prisma.storeStock.count({
        where: { storeId },
      }),
    ])

    return {
      totalOrders: orders,
      totalInvoices: invoices,
      totalProducts: stock,
    }
  }

  /**
   * Get unique regions
   */
  static async getRegions() {
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
      },
      select: { region: true },
      distinct: ["region"],
    })

    // Filter out null regions and return sorted list
    return stores
      .map((s) => s.region)
      .filter((r): r is string => r !== null)
      .sort()
  }

  /**
   * Get unique cities
   */
  static async getCities(region?: string) {
    const where: Prisma.StoreWhereInput = {
      isActive: true,
    }

    if (region) {
      where.region = region
    }

    const stores = await prisma.store.findMany({
      where,
      select: { city: true },
      distinct: ["city"],
    })

    return stores.map((s) => s.city).sort()
  }

  /**
   * Get orders for a store
   */
  static async getStoreOrders(storeId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }) {
    const where: Prisma.OrderWhereInput = {
      storeId,
    }

    if (filters?.status) {
      where.status = filters.status as any
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Get stock levels for a store
   */
  static async getStoreStock(storeId: string) {
    return prisma.storeStock.findMany({
      where: { storeId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    })
  }
}
