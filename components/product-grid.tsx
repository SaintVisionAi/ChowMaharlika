"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { getCategoryImage } from "@/lib/category-images"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  stock_quantity: number
  unit: string
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart()

  const handleAddToCart = async (product: Product) => {
    await addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
      category: product.category,
    })
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No products available at the moment.</p>
        <p className="text-sm text-muted-foreground mt-2">Check back soon for new arrivals!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const categoryImage = getCategoryImage(product.category)
        
        return (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative bg-muted">
            <Image
              src={categoryImage.url}
              alt={categoryImage.alt}
              fill
              className="object-cover"
              unoptimized
            />
            {product.stock_quantity < 10 && product.stock_quantity > 0 && (
              <Badge className="absolute top-2 right-2" variant="destructive">
                Low Stock
              </Badge>
            )}
            {product.stock_quantity === 0 && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                Out of Stock
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">/ {product.unit}</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToCart(product)} disabled={product.stock_quantity === 0}>
              {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </CardFooter>
        </Card>
      )})
      }
    </div>
  )
}
