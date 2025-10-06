"use client"

import { useState } from "react"
import { PremiumProductGrid } from "@/components/premium-product-grid"
import { SaintAthenaIntro } from "@/components/saint-athena-intro"
import { SaintAthena } from "@/components/saint-athena"

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

interface SeafoodPageClientProps {
  products: Product[]
}

export function SeafoodPageClient({ products }: SeafoodPageClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* SaintAthena Introduction */}
      <SaintAthenaIntro onOpenChat={() => setIsChatOpen(true)} />

      {/* Products Grid */}
      <PremiumProductGrid 
        products={products} 
        title="Fresh Seafood"
        subtitle="Hand-selected premium seafood delivered fresh daily. From wild-caught fish to sustainable shellfish, we bring the ocean's finest to your table."
      />

      {/* SaintAthena Chat System */}
      <SaintAthena />
    </>
  )
}
