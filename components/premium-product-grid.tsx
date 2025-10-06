"use client"

import React, { useState, useMemo } from "react"
import { PremiumProductCard } from "@/components/premium-product-card"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Grid, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  stock_quantity: number
  unit: string
  rating?: number
  origin?: string
  tags?: string[]
}

interface PremiumProductGridProps {
  products: Product[]
  title?: string
  subtitle?: string
}

type SortOption = "name" | "price-low" | "price-high" | "rating"
type ViewMode = "grid" | "list"

export function PremiumProductGrid({ products, title, subtitle }: PremiumProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Enhanced products with mock data for demo
  const enhancedProducts = useMemo(() => {
    return products.map((product, index) => ({
      ...product,
      rating: product.rating || (4.0 + Math.random()),
      origin: product.origin || (product.category === 'seafood' ? 'Atlantic Ocean' : 'Farm Fresh'),
      tags: product.tags || (product.category === 'seafood' 
        ? ['Fresh', 'Wild-Caught', 'Sustainable'] 
        : ['Organic', 'Premium', 'Natural'])
    }))
  }, [products])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(enhancedProducts.map(p => p.category)))
    return [{ value: "all", label: "All Products" }, ...cats.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))]
  }, [enhancedProducts])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = enhancedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [enhancedProducts, searchQuery, selectedCategory, sortBy])

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (!enhancedProducts || enhancedProducts.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Products Found</h3>
          <p className="text-gray-600 mb-8">
            We couldn't find any products at the moment. Check back soon for new arrivals!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      {(title || subtitle) && (
        <div className="text-center space-y-4 mb-8">
          {title && (
            <h1 className="text-4xl md:text-5xl font-serif font-bold gold-shimmer">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-zinc-900/90 backdrop-blur-sm border-2 border-yellow-500/30 focus:border-yellow-500 text-white placeholder:text-gray-400 rounded-xl"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 text-white"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            {showFilters && (
              <div className="flex items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40 bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Results Count */}
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-semibold">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
            </Badge>

            {/* View Mode Toggle */}
            <div className="flex border-2 border-yellow-500/30 rounded-lg bg-zinc-900/90 backdrop-blur-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-r-none",
                  viewMode === "grid" && "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                )}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-l-none",
                  viewMode === "list" && "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center">
            <Search className="w-10 h-10 text-yellow-400" />
          </div>
          <p className="text-xl text-white mb-2">No products match your criteria</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={cn(
          "transition-all duration-500 ease-in-out",
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            : "space-y-6"
        )}>
          {filteredAndSortedProducts.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "animate-fade-in-up opacity-0",
                "animation-delay-" + (index % 8) // Stagger animation for first 8 items
              )}
              style={{ animationDelay: `${(index % 8) * 100}ms` }}
            >
              <PremiumProductCard
                product={product}
                onViewDetails={handleViewDetails}
                className={viewMode === "list" ? "flex flex-row max-w-4xl" : ""}
              />
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default PremiumProductGrid
