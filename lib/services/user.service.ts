import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  storeId?: string
  createdById?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  storeId?: string
  isActive?: boolean
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: CreateUserInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        storeId: data.storeId,
        createdById: data.createdById,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
        createdAt: true,
      },
    })

    return user
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
      },
    })
  }

  /**
   * List users with optional filters
   */
  static async listUsers(filters?: {
    role?: UserRole
    storeId?: string
    isActive?: boolean
    search?: string
  }) {
    const where: any = {}

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.storeId) {
      where.storeId = filters.storeId
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: UpdateUserInput) {
    const updateData: any = { ...data }

    // Hash password if provided
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10)
      delete updateData.password
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
        updatedAt: true,
      },
    })
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  static async deleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        isActive: true,
      },
    })
  }

  /**
   * Change user password
   */
  static async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    })
  }
}

