"use client"

import { Fish, Milk, Apple, Package, ShoppingBasket, Wheat, Beef, Egg } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductImageFallbackProps {
  productName: string
  category?: string
  className?: string
}

// Category-based gradients with gold accent
const categoryGradients: Record<string, string> = {
  seafood: "from-blue-600 via-cyan-500 to-teal-500",
  dairy: "from-purple-500 via-pink-500 to-rose-500",
  produce: "from-green-500 via-emerald-500 to-lime-500",
  meat: "from-red-600 via-rose-500 to-pink-500",
  grocery: "from-amber-500 via-yellow-500 to-orange-500",
  bakery: "from-orange-500 via-amber-500 to-yellow-500",
  default: "from-yellow-500 via-yellow-400 to-amber-500",
}

// Category-based icons
const categoryIcons: Record<string, React.ElementType> = {
  seafood: Fish,
  dairy: Milk,
  produce: Apple,
  meat: Beef,
  grocery: ShoppingBasket,
  bakery: Wheat,
  eggs: Egg,
  default: Package,
}

export function ProductImageFallback({ 
  productName, 
  category = "default", 
  className 
}: ProductImageFallbackProps) {
  const gradient = categoryGradients[category.toLowerCase()] || categoryGradients.default
  const Icon = categoryIcons[category.toLowerCase()] || categoryIcons.default
  
  // Extract first letter for text fallback
  const initial = productName?.charAt(0).toUpperCase() || "?"

  return (
    <div 
      className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br", gradient,
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-pulse delay-700" />
        </div>
      </div>

      {/* Gold accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-600/20 mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-6">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-xl" />
          <Icon className="relative w-20 h-20 md:w-24 md:h-24 text-white drop-shadow-2xl" strokeWidth={1.5} />
        </div>

        {/* Product Initial */}
        <div className="text-6xl md:text-7xl font-bold text-white/90 drop-shadow-2xl">
          {initial}
        </div>

        {/* Gold shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-300/30 to-transparent animate-shimmer" 
          style={{
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-white/30" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/30" />
    </div>
  )
}
