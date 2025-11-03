import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "border-gold/30 bg-white/50",
      success: "border-green-500/30 bg-green-50/50",
      error: "border-red-500/30 bg-red-50/50",
      warning: "border-yellow-500/30 bg-yellow-50/50",
      info: "border-blue-500/30 bg-blue-50/50",
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-xl glass border p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertIcon = ({ variant }: { variant?: AlertProps["variant"] }) => {
  const icons = {
    default: AlertCircle,
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    default: "text-gold",
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }

  const Icon = icons[variant || "default"]

  return <Icon className={cn("h-4 w-4", colors[variant || "default"])} />
}

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h5
      ref={ref}
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
})
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
})
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertIcon, AlertTitle, AlertDescription }

