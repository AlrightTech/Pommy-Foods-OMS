import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl bg-white/50 border border-gold/20 px-4 py-3 text-sm font-medium",
          "placeholder:text-foreground/30",
          "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

