"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProductImageFallback } from "@/components/product-image-fallback"
import { ShoppingBag, Trash2, Plus, Minus, Tag, TrendingUp } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, loading } = useCart()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <p className="text-center">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#0f0f0f]">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-4xl font-serif font-bold gold-shimmer mb-4">Your Cart is Empty</h1>
          <p className="text-gray-300 mb-8">Start shopping to add items to your cart.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-bold">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button asChild variant="outline" className="border-yellow-500/30 text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400">
              <Link href="/seafood">Fresh Seafood</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = total
  const hasDeals = items.some(item => item.sale_price && item.sale_price < item.price)
  const savings = items.reduce((acc, item) => {
    if (item.sale_price && item.sale_price < item.price) {
      return acc + ((item.price - item.sale_price) * item.quantity)
    }
    return acc
  }, 0)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold gold-shimmer mb-2">Shopping Cart</h1>
            <p className="text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          {hasDeals && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2 text-sm">
              <Tag className="h-4 w-4 mr-2" />
              Saving ${savings.toFixed(2)}!
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemHasDeal = item.sale_price && item.sale_price < item.price
              const itemSavings = itemHasDeal ? (item.price - (item.sale_price || item.price)) * item.quantity : 0
              
              return (
              <Card key={item.id} className="glass-effect border-yellow-500/20 hover-lift">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 relative bg-gradient-to-br from-zinc-900 to-black rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url && !item.image_url.includes('placeholder') ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <ProductImageFallback 
                          productName={item.name}
                          category={item.category || 'default'}
                          className="rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                          <p className="text-sm text-gray-400 capitalize">{item.category}</p>
                        </div>
                        {itemHasDeal && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            Save ${itemSavings.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 hover:bg-yellow-500/20 hover:text-yellow-400"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-white">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 hover:bg-yellow-500/20 hover:text-yellow-400"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">${((item.sale_price || item.price) * item.quantity).toFixed(2)}</p>
                      {itemHasDeal && (
                        <p className="text-sm text-gray-500 line-through">${(item.price * item.quantity).toFixed(2)}</p>
                      )}
                      <p className="text-sm text-gray-400">${(item.sale_price || item.price).toFixed(2)} each</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 glass-effect border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-yellow-400" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Items ({itemCount})</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <span className="text-yellow-400 font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Savings
                    </span>
                    <span className="font-bold text-yellow-400">-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-sm text-gray-400">At checkout</span>
                </div>
                <Separator className="bg-zinc-700" />
                <div className="flex justify-between text-lg pt-2">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-2xl gold-shimmer">${total.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <p className="text-xs text-center text-yellow-400/70">
                    You're saving ${savings.toFixed(2)} on this order!
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-3 pt-6">
                <Button className="w-full h-12 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-bold text-lg shadow-lg" size="lg" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent border-yellow-500/30 text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
