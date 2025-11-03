"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-xl bg-white/50 border border-gold/20 px-4 py-2 text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-300",
            "pr-8",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

