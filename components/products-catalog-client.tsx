"use client"

import { useState, useMemo } from "react"
import { PremiumProductCard } from "@/components/premium-product-card"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { ProductFilters, FilterOptions } from "@/components/product-filters"
import { Pagination } from "@/components/pagination"
import { SaintAthenaIntro } from "@/components/saint-athena-intro"
import { SaintAthena } from "@/components/saint-athena"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Grid, List, X, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  stock_quantity: number
  is_available: boolean
  rating?: number
  origin?: string
  tags?: string[]
}

interface ProductsCatalogClientProps {
  products: Product[]
}

type SortOption = "name" | "price-low" | "price-high" | "rating"
type ViewMode = "grid" | "list"

export function ProductsCatalogClient({ products }: ProductsCatalogClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false)
  
  const ITEMS_PER_PAGE = 24

  // Calculate max price for slider
  const maxPrice = useMemo(() => {
    return Math.ceil(Math.max(...products.map(p => p.price)))
  }, [products])

  // Initial filter state
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, maxPrice],
    inStock: false
  })

  // Enhanced products with mock data
  const enhancedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      rating: product.rating || (4.0 + Math.random()),
      origin: product.origin || (product.category === 'seafood' ? 'Pacific Ocean' : 'Premium Quality'),
      tags: product.tags || ['Premium', 'Quality']
    }))
  }, [products])

  // Get available categories with counts
  const availableCategories = useMemo(() => {
    const categoryCounts = enhancedProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCounts)
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }, [enhancedProducts])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = enhancedProducts.filter(product => {
      // Text search
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
                             filters.categories.includes(product.category)
      
      // Price range filter
      const matchesPrice = product.price >= filters.priceRange[0] && 
                          product.price <= filters.priceRange[1]
      
      // Stock filter
      const matchesStock = !filters.inStock || (product.stock_quantity > 0)

      return matchesSearch && matchesCategory && matchesPrice && matchesStock
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
  }, [enhancedProducts, searchQuery, filters, sortBy])

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredAndSortedProducts.slice(startIndex, endIndex)
  }, [filteredAndSortedProducts, currentPage])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, maxPrice],
      inStock: false
    })
    setCurrentPage(1)
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const activeFilterCount = filters.categories.length + 
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0)

  return (
    <>
      {/* SaintAthena Introduction */}
      <SaintAthenaIntro onOpenChat={() => {}} />

      <div className="space-y-8 mt-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold gold-shimmer">
            Complete Product Catalog
          </h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Explore our entire collection of {products.length.toLocaleString()}+ premium products. 
            From fresh seafood to authentic Filipino groceries, find everything you need in one place.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search through our entire catalog..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-16 bg-zinc-900/90 backdrop-blur-sm border-2 border-yellow-500/30 focus:border-yellow-500 text-white placeholder:text-gray-400 rounded-xl text-lg"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Main Layout: Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters
                availableCategories={availableCategories}
                maxPrice={maxPrice}
                currentFilters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/50 backdrop-blur-sm border-2 border-yellow-500/20 rounded-2xl">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Mobile Filters Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFiltersSidebar(!showFiltersSidebar)}
                  className="lg:hidden bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500 text-white"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-yellow-500 text-gray-900">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {/* Sort */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48 bg-zinc-900/90 backdrop-blur-sm border-yellow-500/30 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* Results Count */}
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-semibold px-4 py-2">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {filteredAndSortedProducts.length.toLocaleString()} products
                </Badge>
              </div>

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

            {/* Mobile Filters Drawer */}
            {showFiltersSidebar && (
              <div className="lg:hidden">
                <ProductFilters
                  availableCategories={availableCategories}
                  maxPrice={maxPrice}
                  currentFilters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            )}

            {/* Products Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center">
                  <Search className="w-12 h-12 text-yellow-400" />
                </div>
                <p className="text-2xl text-white mb-4">No products found</p>
                <p className="text-gray-400 mb-8">Try adjusting your search or filters</p>
                <Button
                  onClick={handleResetFilters}
                  className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={cn(
                  "transition-all duration-500",
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
                    : "space-y-6"
                )}>
                  {paginatedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${(index % 12) * 50}ms` }}
                    >
                      <PremiumProductCard
                        product={product}
                        onViewDetails={handleViewDetails}
                        className={viewMode === "list" ? "flex flex-row" : ""}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredAndSortedProducts.length}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* SaintAthena Chat */}
      <SaintAthena />

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </>
  )
}
