"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  totalItems: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Maximum page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      {/* Items counter */}
      <div className="text-sm text-gray-400">
        Showing <span className="text-yellow-400 font-semibold">{startItem}</span> to{" "}
        <span className="text-yellow-400 font-semibold">{endItem}</span> of{" "}
        <span className="text-yellow-400 font-semibold">{totalItems}</span> products
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            "bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white",
            currentPage === 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white",
            currentPage === 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-2">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "min-w-[40px]",
                  isActive
                    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400 border-yellow-500"
                    : "bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white"
                )}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        {/* Mobile: current page indicator */}
        <div className="sm:hidden px-4 py-2 bg-zinc-900/90 backdrop-blur-sm border-2 border-yellow-500/30 rounded-lg text-white font-semibold">
          {currentPage} / {totalPages}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white",
            currentPage === totalPages && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            "bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-white",
            currentPage === totalPages && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
