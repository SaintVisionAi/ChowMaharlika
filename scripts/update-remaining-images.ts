#!/usr/bin/env tsx
/**
 * Update remaining product images
 * Fetches ALL products including those without images
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// High-quality seafood images from Unsplash
const SEAFOOD_IMAGES: Record<string, string> = {
  salmon: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80",
  tuna: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
  cod: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
  tilapia: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  mackerel: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80",
  shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
  prawn: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
  crab: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80",
  lobster: "https://images.unsplash.com/photo-1625152587976-4f66b1f16c9d?w=800&q=80",
  scallop: "https://images.unsplash.com/photo-1580651315530-8762a929a10d?w=800&q=80",
  oyster: "https://images.unsplash.com/photo-1570623710374-d5d0ec7eb8dc?w=800&q=80",
  clam: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  mussel: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80",
  squid: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  octopus: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  calamari: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  caviar: "https://images.unsplash.com/photo-1585583408634-8f69c47bc45a?w=800&q=80",
  roe: "https://images.unsplash.com/photo-1585583408634-8f69c47bc45a?w=800&q=80",
  halibut: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
  bass: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  snapper: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  trout: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80",
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  seafood: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  fish: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  shellfish: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  produce: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80",
  meat: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80",
  frozen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  prepared: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  default: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
}

function findProductImage(productName: string, category?: string): string {
  if (!productName) return CATEGORY_FALLBACKS.default

  const nameLower = productName.toLowerCase()

  // Try exact matches
  for (const [keyword, imageUrl] of Object.entries(SEAFOOD_IMAGES)) {
    if (nameLower.includes(keyword)) {
      return imageUrl
    }
  }

  // Try category fallback
  if (category) {
    const categoryLower = category.toLowerCase()
    for (const [catKey, imageUrl] of Object.entries(CATEGORY_FALLBACKS)) {
      if (categoryLower.includes(catKey)) {
        return imageUrl
      }
    }
  }

  return CATEGORY_FALLBACKS.default
}

async function updateRemainingImages() {
  console.log('🚀 Updating remaining product images\n')

  // Fetch products in pages of 1000 until we get all
  let allProducts: any[] = []
  let page = 0
  const pageSize = 1000

  while (true) {
    console.log(`📄 Fetching page ${page + 1}...`)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category, image_url')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('name')

    if (error) {
      console.error('❌ Error:', error)
      break
    }

    if (!products || products.length === 0) {
      break
    }

    allProducts = allProducts.concat(products)
    console.log(`   Got ${products.length} products (total: ${allProducts.length})`)

    if (products.length < pageSize) {
      break // Last page
    }

    page++
  }

  console.log(`\n📦 Total products fetched: ${allProducts.length}`)

  // Filter products that need images
  const productsNeedingImages = allProducts.filter(p =>
    !p.image_url || p.image_url.includes('placeholder')
  )

  console.log(`📸 Products needing images: ${productsNeedingImages.length}\n`)

  if (productsNeedingImages.length === 0) {
    console.log('✅ All products already have images!')
    return
  }

  // Update in batches
  let updated = 0
  const batchSize = 50

  for (let i = 0; i < productsNeedingImages.length; i += batchSize) {
    const batch = productsNeedingImages.slice(i, i + batchSize)
    console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, productsNeedingImages.length)} of ${productsNeedingImages.length})`)

    const updates = batch.map(async (product) => {
      const imageUrl = findProductImage(product.name, product.category)

      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', product.id)

      if (!error) {
        updated++
        if (updated % 100 === 0) {
          console.log(`   ✓ Updated ${updated} products...`)
        }
      }
    })

    await Promise.all(updates)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Update Complete!')
  console.log(`📊 Updated ${updated} products with images`)
  console.log('='.repeat(60))
}

updateRemainingImages().catch(console.error)
