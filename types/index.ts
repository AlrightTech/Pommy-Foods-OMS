// Type definitions for the application

export type UserRole = 
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STORE_OWNER"
  | "STORE_MANAGER"
  | "KITCHEN_STAFF"
  | "DRIVER"

export type OrderStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "KITCHEN_PREP"
  | "READY"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"

export type OrderType = "MANUAL" | "AUTO_REPLENISH"

export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"

export type InvoiceStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"

export type PaymentMethod =
  | "CASH"
  | "DIRECT_DEBIT"
  | "ONLINE_PAYMENT"
  | "BANK_TRANSFER"

