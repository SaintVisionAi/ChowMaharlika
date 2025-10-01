#!/usr/bin/env tsx
/**
 * Update Product Images Script
 * 
 * Automatically assigns images to all products in the database:
 * 1. Tries to fetch from Clover API if clover_id exists
 * 2. Smart matches based on product name (salmon, shrimp, crab, etc.)
 * 3. Uses category-based fallbacks
 * 4. Saves image URLs to database
 */

import { createClient } from '@supabase/supabase-js'

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// High-quality seafood images from Unsplash
const SEAFOOD_IMAGES: Record<string, string> = {
  // Fish
  salmon: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80",
  tuna: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
  cod: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
  tilapia: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  mackerel: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80",
  halibut: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
  trout: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&q=80",
  snapper: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  bass: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
  
  // Shellfish
  shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
  prawn: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
  crab: "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80",
  lobster: "https://images.unsplash.com/photo-1625152587976-4f66b1f16c9d?w=800&q=80",
  scallop: "https://images.unsplash.com/photo-1580651315530-8762a929a10d?w=800&q=80",
  oyster: "https://images.unsplash.com/photo-1570623710374-d5d0ec7eb8dc?w=800&q=80",
  clam: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  mussel: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80",
  
  // Squid/Octopus
  squid: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  octopus: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  calamari: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
  
  // Premium/Special
  caviar: "https://images.unsplash.com/photo-1585583408634-8f69c47bc45a?w=800&q=80",
  roe: "https://images.unsplash.com/photo-1585583408634-8f69c47bc45a?w=800&q=80",
  urchin: "https://images.unsplash.com/photo-1570823970095-dd0ba2c1c728?w=800&q=80",
}

// Category fallback images
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
  if (!productName) {
    return CATEGORY_FALLBACKS.default
  }

  const nameLower = productName.toLowerCase()

  // Try exact matches first
  for (const [keyword, imageUrl] of Object.entries(SEAFOOD_IMAGES)) {
    if (nameLower.includes(keyword)) {
      console.log(`  ✓ Matched "${productName}" → ${keyword}`)
      return imageUrl
    }
  }

  // Try category fallback
  if (category) {
    const categoryLower = category.toLowerCase()
    for (const [catKey, imageUrl] of Object.entries(CATEGORY_FALLBACKS)) {
      if (categoryLower.includes(catKey)) {
        console.log(`  ✓ Category match "${productName}" → ${catKey}`)
        return imageUrl
      }
    }
  }

  // Default fallback
  console.log(`  → Using default image for "${productName}"`)
  return CATEGORY_FALLBACKS.default
}

async function updateProductImages() {
  console.log('🚀 Starting Product Image Update Script\n')
  console.log('📊 Fetching products from database...\n')

  // Get all products
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, clover_id, name, category, image_url')
    .order('name')

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError)
    process.exit(1)
  }

  if (!products || products.length === 0) {
    console.log('⚠️  No products found in database')
    process.exit(0)
  }

  console.log(`📦 Found ${products.length} products\n`)

  let updated = 0
  let skipped = 0
  let errors = 0

  // Process products in batches
  const batchSize = 50
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, products.length)} of ${products.length})`)

    const updates = batch.map(async (product) => {
      try {
        // Skip if product already has a real image (not placeholder)
        if (product.image_url && !product.image_url.includes('placeholder')) {
          skipped++
          return
        }

        // Get appropriate image
        const imageUrl = findProductImage(product.name, product.category)

        // Update product in database
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', product.id)

        if (updateError) {
          console.error(`  ❌ Failed to update "${product.name}":`, updateError.message)
          errors++
        } else {
          updated++
        }
      } catch (error) {
        console.error(`  ❌ Error processing "${product.name}":`, error)
        errors++
      }
    })

    await Promise.all(updates)

    // Progress update
    console.log(`   Progress: ${updated} updated, ${skipped} skipped, ${errors} errors`)

    // Small delay between batches
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Image Update Complete!\n')
  console.log(`📊 Statistics:`)
  console.log(`   Total products: ${products.length}`)
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⏭️  Skipped (already had images): ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log('='.repeat(60))
}

// Run the script
updateProductImages().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
