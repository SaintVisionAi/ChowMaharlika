"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  Leaf, 
  Award,
  Clock,
  Thermometer,
  Fish
} from "lucide-react"
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

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  if (!product) return null

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image_url: product.image_url,
        category: product.category,
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />)
    }

    return stars
  }

  // Mock detailed product data (in a real app, this would come from your database)
  const productDetails = {
    nutritionalInfo: {
      calories: product.category === 'seafood' ? '120 per 100g' : '350 per 100g',
      protein: product.category === 'seafood' ? '22g' : '5g',
      fat: product.category === 'seafood' ? '3g' : '12g',
      sodium: '200mg',
    },
    ingredients: product.category === 'seafood' 
      ? ['Fresh Atlantic Salmon', 'Sea Salt'] 
      : ['Premium Rice', 'Natural Flavoring'],
    storageInstructions: product.category === 'seafood'
      ? 'Keep refrigerated at 32-38°F. Use within 2 days of purchase.'
      : 'Store in a cool, dry place. Best before 12 months from production date.',
    sustainabilityInfo: product.category === 'seafood'
      ? 'Wild-caught using sustainable fishing methods. MSC certified.'
      : 'Organic certified, non-GMO, ethically sourced.',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid md:grid-cols-2 h-full">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <Image
              src={product.image_url || `/api/placeholder/600/600?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm",
                "hover:bg-white hover:scale-110 transition-all duration-200",
                isFavorited && "bg-red-50 text-red-500"
              )}
              onClick={() => setIsFavorited(!isFavorited)}
            >
              <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
            </Button>

            {/* Premium Badge */}
            {product.category === 'seafood' && (
              <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white border-0 font-medium">
                Premium Fresh
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4">
              {/* Origin */}
              {product.origin && (
                <div className="text-sm font-medium text-primary/70 tracking-wider uppercase mb-2">
                  {product.origin}
                </div>
              )}

              {/* Product Name */}
              <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </DialogTitle>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.rating}) • 127 reviews
                  </span>
                </div>
              )}
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 pt-2 space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500">
                    per {product.unit}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {product.stock_quantity > 10 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      In Stock ({product.stock_quantity} available)
                    </Badge>
                  )}
                  {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Low Stock ({product.stock_quantity} left)
                    </Badge>
                  )}
                  {product.stock_quantity === 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-3">
                  {product.category === 'seafood' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Fish className="w-4 h-4 text-blue-500" />
                        Wild Caught
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Thermometer className="w-4 h-4 text-blue-500" />
                        Fresh
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Leaf className="w-4 h-4 text-green-500" />
                    Sustainable
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-purple-500" />
                    Premium Quality
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Detailed Information Tabs */}
                <Tabs defaultValue="nutrition" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="care">Care & Storage</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="nutrition" className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calories</span>
                        <span className="font-medium">{productDetails.nutritionalInfo.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Protein</span>
                        <span className="font-medium">{productDetails.nutritionalInfo.protein}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fat</span>
                        <span className="font-medium">{productDetails.nutritionalInfo.fat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sodium</span>
                        <span className="font-medium">{productDetails.nutritionalInfo.sodium}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ingredients" className="mt-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {productDetails.ingredients.map((ingredient, index) => (
                        <li key={index}>• {ingredient}</li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="care" className="mt-4">
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-600">
                        {productDetails.storageInstructions}
                      </p>
                      <p className="text-green-600 font-medium">
                        🌱 {productDetails.sustainabilityInfo}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-900">Delivery Information</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Same-day delivery available
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Freshness guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="p-6 bg-gray-50 border-t">
              {/* Quantity Selector */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Total Price */}
              <div className="text-center mb-4">
                <span className="text-2xl font-bold text-primary">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full h-12 text-lg font-medium"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding to Cart...
                  </div>
                ) : product.stock_quantity === 0 ? (
                  "Out of Stock"
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add {quantity} to Cart
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}