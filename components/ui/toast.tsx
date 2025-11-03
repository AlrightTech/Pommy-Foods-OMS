"use client"

import * as React from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

const Toast = ({ title, description, variant = "default", onClose }: ToastProps) => {
  const icons = {
    default: null,
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    default: "border-gold/30 bg-white/80",
    success: "border-green-500/30 bg-green-50/80",
    error: "border-red-500/30 bg-red-50/80",
    warning: "border-yellow-500/30 bg-yellow-50/80",
    info: "border-blue-500/30 bg-blue-50/80",
  }

  const Icon = icons[variant]

  return (
    <div
      className={cn(
        "rounded-xl glass border p-4 shadow-lg glow-gold-sm animate-slide-in-right",
        colors[variant],
        "min-w-[300px] max-w-md"
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className={cn(
          "h-5 w-5 mt-0.5",
          variant === "success" && "text-green-600",
          variant === "error" && "text-red-600",
          variant === "warning" && "text-yellow-600",
          variant === "info" && "text-blue-600"
        )} />}
        <div className="flex-1">
          {title && (
            <p className="text-sm font-semibold text-foreground">{title}</p>
          )}
          {description && (
            <p className="text-sm text-foreground/70 mt-1">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-foreground/50 hover:text-foreground hover:bg-white/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export { Toast }

