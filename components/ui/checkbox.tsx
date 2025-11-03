"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "peer h-5 w-5 rounded-lg border-2 border-gold/30 bg-white/50",
            "peer-checked:bg-gradient-to-br peer-checked:from-gold peer-checked:to-gold-dark peer-checked:border-gold",
            "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50",
            "transition-all duration-300",
            "flex items-center justify-center",
            className
          )}
        >
          <Check
            className={cn(
              "h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            )}
          />
        </div>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

