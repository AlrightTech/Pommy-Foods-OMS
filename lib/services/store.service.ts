import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface CreateStoreInput {
  name: string
  contactName: string
  email?: string
  phone: string
  address: string
  city: string
  region: string
  latitude?: number
  longitude?: number
  creditLimit?: number
  paymentTerms?: number
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
  search?: string
  region?: string
  city?: string
  isActive?: boolean
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
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        creditLimit: data.creditLimit || 0,
        paymentTerms: data.paymentTerms || 30,
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
            isActive: true,
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

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { contactName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters?.region) {
      where.region = filters.region
    }

    if (filters?.city) {
      where.city = filters.city
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    return prisma.store.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Update store
   */
  static async updateStore(id: string, data: UpdateStoreInput) {
    return prisma.store.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete store (soft delete by deactivating)
   */
  static async deleteStore(id: string) {
    return prisma.store.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * Get store stock levels
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

  /**
   * Get store orders
   */
  static async getStoreOrders(storeId: string, filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
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
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Get store invoices
   */
  static async getStoreInvoices(storeId: string, filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: Prisma.InvoiceWhereInput = {
      storeId,
    }

    if (filters?.status) {
      where.status = filters.status as any
    }

    if (filters?.startDate || filters?.endDate) {
      where.issuedAt = {}
      if (filters.startDate) {
        where.issuedAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.issuedAt.lte = filters.endDate
      }
    }

    return prisma.invoice.findMany({
      where,
      include: {
        payments: true,
      },
      orderBy: { issuedAt: "desc" },
    })
  }

  /**
   * Get unique regions
   */
  static async getRegions() {
    const stores = await prisma.store.findMany({
      where: {
        region: { not: null },
        isActive: true,
      },
      select: { region: true },
      distinct: ["region"],
    })

    return stores.map((s) => s.region).sort()
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
}

