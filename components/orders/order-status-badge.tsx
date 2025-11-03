import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING: { label: "Pending", variant: "default" },
  APPROVED: { label: "Approved", variant: "success" },
  KITCHEN_PREP: { label: "Kitchen Prep", variant: "default" },
  READY: { label: "Ready", variant: "success" },
  IN_DELIVERY: { label: "In Delivery", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

