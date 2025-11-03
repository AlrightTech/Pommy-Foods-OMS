// Application constants

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  STORE: "/store",
  DRIVER: "/driver",
  KITCHEN: "/kitchen",
} as const

export const ORDER_STATUSES = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  KITCHEN_PREP: "KITCHEN_PREP",
  READY: "READY",
  IN_DELIVERY: "IN_DELIVERY",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
} as const

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  STORE_OWNER: "STORE_OWNER",
  STORE_MANAGER: "STORE_MANAGER",
  KITCHEN_STAFF: "KITCHEN_STAFF",
  DRIVER: "DRIVER",
} as const

