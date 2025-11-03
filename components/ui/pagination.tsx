"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  
  // Show max 5 page numbers
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages
    if (currentPage <= 3) return pages.slice(0, 5)
    if (currentPage >= totalPages - 2) return pages.slice(totalPages - 5)
    return pages.slice(currentPage - 3, currentPage + 2)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-xl"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className="rounded-xl min-w-[40px]"
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-xl"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

