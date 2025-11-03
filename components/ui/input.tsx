import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl bg-white/50 border border-gold/20 px-4 py-2 text-sm font-medium",
          "placeholder:text-foreground/30",
          "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

