"use client"

import { useState } from "react"
import { PremiumProductGrid } from "@/components/premium-product-grid"
// import { SaintAthenaIntro } from "@/components/saint-athena-intro" // Only on home page

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

interface GroceryPageClientProps {
  products: Product[]
}

export function GroceryPageClient({ products }: GroceryPageClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* SaintAthena intro removed - only on home page, floating chat button available */}

      {/* Products Grid */}
      <PremiumProductGrid 
        products={products} 
        title="Premium Grocery"
        subtitle="Curated selection of international and local grocery items. From Filipino favorites to Asian specialties, find everything you need for authentic home cooking."
      />
    </>
  )
}
