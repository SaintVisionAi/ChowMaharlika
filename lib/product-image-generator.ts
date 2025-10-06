/**
 * Product Image Generator
 * 
 * Generates product images using various AI services and APIs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ImageGenerationOptions {
  method: 'unsplash' | 'openai' | 'stable-diffusion' | 'placeholder'
  category: string
  productName: string
  description?: string
}

/**
 * Option 1: Unsplash API (FREE - Real Photos)
 * Best for: Generic products, food items
 */
export async function generateFromUnsplash(productName: string, category: string): Promise<string | null> {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
  
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('[ImageGen] Unsplash API key not configured')
    return null
  }

  try {
    // Search for product image
    const searchQuery = `${productName} ${category} food`
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=squarish`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular
      console.log(`[ImageGen] Found Unsplash image for: ${productName}`)
      return imageUrl
    }

    return null
  } catch (error) {
    console.error('[ImageGen] Unsplash error:', error)
    return null
  }
}

/**
 * Option 2: OpenAI DALL-E 3 ($0.04 per image)
 * Best for: Specific products that need exact representation
 */
export async function generateFromDALLE(productName: string, description: string): Promise<string | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
  if (!OPENAI_API_KEY) {
    console.log('[ImageGen] OpenAI API key not configured')
    return null
  }

  try {
    const prompt = `Professional product photography of ${productName}. ${description}. Clean white background, studio lighting, high quality, centered composition, e-commerce product photo.`
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      console.log(`[ImageGen] Generated DALL-E image for: ${productName}`)
      return data.data[0].url
    }

    return null
  } catch (error) {
    console.error('[ImageGen] DALL-E error:', error)
    return null
  }
}

/**
 * Option 3: Placeholder.com with Product Info
 * Best for: Free, instant, customizable placeholders
 */
export function generatePlaceholder(productName: string, category: string): string {
  // Create a nice placeholder with product name
  const text = encodeURIComponent(productName.slice(0, 30))
  const categoryColors: Record<string, string> = {
    seafood: '0ea5e9', // Blue
    grocery: '10b981', // Green
    meat: 'ef4444',    // Red
    produce: '84cc16', // Lime
    bakery: 'f59e0b',  // Amber
    dairy: 'fbbf24',   // Yellow
    deli: 'ec4899',    // Pink
  }
  
  const color = categoryColors[category] || '6366f1' // Default purple
  
  return `https://placehold.co/600x600/${color}/ffffff?text=${text}&font=montserrat`
}

/**
 * Option 4: AI Image Proxy Service (Recommended)
 * Uses multiple free services as fallback chain
 */
export async function generateProductImage(
  productName: string,
  category: string,
  description?: string
): Promise<string> {
  console.log(`[ImageGen] Generating image for: ${productName}`)

  // Try Unsplash first (free, real photos)
  const unsplashImage = await generateFromUnsplash(productName, category)
  if (unsplashImage) return unsplashImage

  // Fallback to smart placeholder
  return generatePlaceholder(productName, category)
}

/**
 * Bulk generate images for all products
 */
export async function bulkGenerateProductImages(
  options: {
    batchSize?: number
    delay?: number
    method?: 'unsplash' | 'placeholder'
  } = {}
) {
  const { batchSize = 10, delay = 1000, method = 'unsplash' } = options

  console.log('[ImageGen] Starting bulk image generation...')

  // Fetch products without images
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category, description')
    .is('image_url', null)
    .limit(500) // Process first 500

  if (error || !products) {
    console.error('[ImageGen] Error fetching products:', error)
    return { success: false, error }
  }

  console.log(`[ImageGen] Found ${products.length} products without images`)

  let updated = 0
  let failed = 0

  // Process in batches
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map(async (product) => {
        try {
          let imageUrl: string | null = null

          if (method === 'unsplash') {
            imageUrl = await generateFromUnsplash(product.name, product.category)
          }

          // Fallback to placeholder if no image found
          if (!imageUrl) {
            imageUrl = generatePlaceholder(product.name, product.category)
          }

          // Update product in database
          const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: imageUrl })
            .eq('id', product.id)

          if (updateError) {
            console.error(`[ImageGen] Failed to update ${product.name}:`, updateError)
            failed++
          } else {
            console.log(`[ImageGen] ✓ Updated: ${product.name}`)
            updated++
          }
        } catch (error) {
          console.error(`[ImageGen] Error processing ${product.name}:`, error)
          failed++
        }
      })
    )

    // Delay between batches to respect API rate limits
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    console.log(`[ImageGen] Progress: ${updated + failed}/${products.length}`)
  }

  console.log('[ImageGen] Bulk generation complete!')
  console.log(`  Updated: ${updated}`)
  console.log(`  Failed: ${failed}`)

  return {
    success: true,
    stats: { total: products.length, updated, failed },
  }
}

/**
 * Generate image for a single product on-demand
 */
export async function generateImageForProduct(productId: string) {
  const { data: product } = await supabase
    .from('products')
    .select('name, category, description')
    .eq('id', productId)
    .single()

  if (!product) return null

  const imageUrl = await generateProductImage(
    product.name,
    product.category,
    product.description
  )

  // Update database
  await supabase
    .from('products')
    .update({ image_url: imageUrl })
    .eq('id', productId)

  return imageUrl
}
