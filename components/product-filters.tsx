"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOptions {
  categories: string[]
  priceRange: [number, number]
  inStock: boolean
}

interface ProductFiltersProps {
  availableCategories: Array<{ value: string; label: string; count: number }>
  maxPrice: number
  currentFilters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onReset: () => void
}

export function ProductFilters({
  availableCategories,
  maxPrice,
  currentFilters,
  onFiltersChange,
  onReset
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(currentFilters.priceRange)

  const handleCategoryToggle = (category: string) => {
    const categories = currentFilters.categories.includes(category)
      ? currentFilters.categories.filter(c => c !== category)
      : [...currentFilters.categories, category]
    
    onFiltersChange({ ...currentFilters, categories })
  }

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]])
  }

  const handlePriceCommit = () => {
    onFiltersChange({ ...currentFilters, priceRange: localPriceRange })
  }

  const handleStockToggle = () => {
    onFiltersChange({ ...currentFilters, inStock: !currentFilters.inStock })
  }

  const activeFilterCount = 
    currentFilters.categories.length + 
    (currentFilters.inStock ? 1 : 0) +
    (currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < maxPrice ? 1 : 0)

  return (
    <div className="space-y-6 p-6 bg-zinc-900/50 backdrop-blur-sm border-2 border-yellow-500/20 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-yellow-500/20">
        <div>
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="mt-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white font-medium">Price Range</Label>
          <div className="flex items-center gap-1 text-sm text-yellow-400 font-semibold">
            <DollarSign className="w-3 h-3" />
            {localPriceRange[0]} - ${localPriceRange[1]}
          </div>
        </div>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={localPriceRange}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>$0</span>
          <span>${maxPrice}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-white font-medium">Categories</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {availableCategories.map(({ value, label, count }) => (
            <label
              key={value}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                "hover:bg-yellow-500/10 border-2",
                currentFilters.categories.includes(value)
                  ? "bg-yellow-500/20 border-yellow-500/50"
                  : "bg-zinc-800/50 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={currentFilters.categories.includes(value)}
                  onCheckedChange={() => handleCategoryToggle(value)}
                  className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                />
                <span className="text-white text-sm font-medium">{label}</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                {count}
              </Badge>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3 pt-4 border-t border-yellow-500/20">
        <Label className="text-white font-medium">Availability</Label>
        <label
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
            "hover:bg-yellow-500/10 border-2",
            currentFilters.inStock
              ? "bg-yellow-500/20 border-yellow-500/50"
              : "bg-zinc-800/50 border-transparent"
          )}
        >
          <Checkbox
            checked={currentFilters.inStock}
            onCheckedChange={handleStockToggle}
            className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
          />
          <span className="text-white text-sm font-medium">In Stock Only</span>
        </label>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
