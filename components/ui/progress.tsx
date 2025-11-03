import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-white/30",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-gradient-to-r from-gold to-gold-dark transition-all duration-500 ease-in-out",
            percentage <= 20 && "from-red-500 to-red-600",
            percentage > 20 && percentage <= 50 && "from-yellow-500 to-yellow-600",
            percentage > 50 && "from-gold to-gold-dark"
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }

