"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { Star, Heart, Eye, ShoppingCart } from "lucide-react"
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

interface PremiumProductCardProps {
  product: Product
  onViewDetails?: (product: Product) => void
  className?: string
}

export function PremiumProductCard({ product, onViewDetails, className }: PremiumProductCardProps) {
  const { addItem } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        category: product.category,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm",
        "hover:shadow-2xl hover:shadow-primary/20 transition-all duration-700 ease-out",
        "hover:scale-[1.02] hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Badge */}
      {product.category === 'seafood' && (
        <Badge className="absolute top-4 left-4 z-20 bg-primary/90 backdrop-blur-sm text-white border-0 font-medium tracking-wide">
          Premium Fresh
        </Badge>
      )}

      {/* Stock Status */}
      {product.stock_quantity < 10 && product.stock_quantity > 0 && (
        <Badge className="absolute top-4 right-4 z-20 bg-amber-500/90 backdrop-blur-sm text-white border-0">
          {product.stock_quantity} left
        </Badge>
      )}

      {product.stock_quantity === 0 && (
        <Badge className="absolute top-4 right-4 z-20 bg-red-500/90 backdrop-blur-sm text-white border-0">
          Sold Out
        </Badge>
      )}

      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "absolute top-4 right-16 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm",
          "opacity-0 group-hover:opacity-100 transition-all duration-300",
          "hover:bg-white hover:scale-110",
          isFavorited && "opacity-100 bg-red-50 text-red-500"
        )}
        onClick={() => setIsFavorited(!isFavorited)}
      >
        <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
      </Button>

      {/* Product Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={product.image_url || `/api/placeholder/400/300?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-all duration-700 ease-out",
            isHovered && "scale-110"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Quick Actions */}
        <div className={cn(
          "absolute inset-x-4 bottom-4 flex gap-2",
          "opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0",
          "transition-all duration-500 ease-out"
        )}>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 border-0"
            onClick={() => onViewDetails?.(product)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Origin/Source */}
        {product.origin && (
          <div className="text-xs font-medium text-primary/70 tracking-wider uppercase">
            {product.origin}
          </div>
        )}

        {/* Product Name */}
        <div>
          <h3 className="font-semibold text-xl text-gray-900 leading-tight line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 min-h-[3rem]">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              per {product.unit}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          className={cn(
            "w-full h-12 font-medium tracking-wide transition-all duration-300",
            "bg-primary hover:bg-primary/90",
            "hover:shadow-lg hover:shadow-primary/25",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isLoading && "pointer-events-none"
          )}
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0 || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </div>
          ) : product.stock_quantity === 0 ? (
            "Sold Out"
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default PremiumProductCard