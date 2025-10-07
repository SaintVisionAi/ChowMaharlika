import { NextRequest, NextResponse } from "next/server"

/**
 * Unsplash Image Generation API
 * Generates product-specific images on-demand when users view product details
 * Uses Unsplash's free API to search for relevant images
 */

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

export async function POST(request: NextRequest) {
  try {
    const { productName, category } = await request.json()

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      )
    }

    // If no Unsplash key, return a category-based fallback
    if (!UNSPLASH_ACCESS_KEY) {
      console.log("[Unsplash] No API key configured, using fallback")
      return NextResponse.json({
        imageUrl: generateFallbackImage(productName, category),
        source: "fallback"
      })
    }

    // Create search query from product name
    const searchQuery = createSearchQuery(productName, category)
    
    console.log("[Unsplash] Searching for:", searchQuery)

    // Search Unsplash for relevant images
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=squarish&content_filter=high`
    
    const response = await fetch(unsplashUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })

    if (!response.ok) {
      console.error("[Unsplash] API error:", response.statusText)
      return NextResponse.json({
        imageUrl: generateFallbackImage(productName, category),
        source: "fallback"
      })
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      console.log("[Unsplash] No results found, using fallback")
      return NextResponse.json({
        imageUrl: generateFallbackImage(productName, category),
        source: "fallback"
      })
    }

    // Get the first high-quality result
    const photo = data.results[0]
    const imageUrl = `${photo.urls.regular}&w=800&h=800&fit=crop&q=80`

    console.log("[Unsplash] Found image:", photo.id)

    return NextResponse.json({
      imageUrl,
      source: "unsplash",
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadLocation: photo.links.download_location
    })

  } catch (error) {
    console.error("[Unsplash] Error generating image:", error)
    const { productName, category } = await request.json().catch(() => ({ productName: "", category: "" }))
    
    return NextResponse.json({
      imageUrl: generateFallbackImage(productName, category),
      source: "error-fallback"
    })
  }
}

/**
 * Create an optimized search query for Unsplash
 */
function createSearchQuery(productName: string, category?: string): string {
  const name = productName.toLowerCase()
  
  // Extract key food terms
  const foodKeywords = [
    'salmon', 'tuna', 'shrimp', 'lobster', 'crab', 'scallop', 'oyster',
    'fish', 'seafood', 'rice', 'noodles', 'sauce', 'beef', 'pork', 'chicken',
    'vegetables', 'fruits', 'bread', 'pasta', 'cheese', 'milk'
  ]

  // Find the primary food keyword
  let mainKeyword = ""
  for (const keyword of foodKeywords) {
    if (name.includes(keyword)) {
      mainKeyword = keyword
      break
    }
  }

  // Build search query
  if (mainKeyword) {
    return `fresh ${mainKeyword} food photography`
  } else if (category) {
    return `fresh ${category} food photography`
  } else {
    // Extract first meaningful word from product name
    const words = productName.split(" ").filter(w => w.length > 3)
    const firstWord = words[0] || productName
    return `fresh ${firstWord} food photography`
  }
}

/**
 * Generate a fallback image URL based on category
 */
function generateFallbackImage(productName: string, category?: string): string {
  const name = productName.toLowerCase()
  
  // Seafood
  if (name.includes('salmon')) return "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80"
  if (name.includes('tuna')) return "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80"
  if (name.includes('shrimp') || name.includes('prawn')) return "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80"
  if (name.includes('lobster')) return "https://images.unsplash.com/photo-1625152587976-4f66b1f16c9d?w=800&q=80"
  if (name.includes('crab')) return "https://images.unsplash.com/photo-1608877906149-79e2a9827469?w=800&q=80"
  if (name.includes('scallop')) return "https://images.unsplash.com/photo-1580651315530-8762a929a10d?w=800&q=80"
  if (name.includes('oyster')) return "https://images.unsplash.com/photo-1570623710374-d5d0ec7eb8dc?w=800&q=80"
  if (name.includes('squid') || name.includes('calamari')) return "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80"
  
  // Meat
  if (name.includes('beef')) return "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80"
  if (name.includes('pork')) return "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&q=80"
  if (name.includes('chicken')) return "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&q=80"
  
  // Grocery
  if (name.includes('rice')) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
  if (name.includes('noodle')) return "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80"
  
  // Category fallbacks
  if (category) {
    const cat = category.toLowerCase()
    if (cat.includes('seafood')) return "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
    if (cat.includes('meat')) return "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80"
    if (cat.includes('produce')) return "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80"
  }
  
  // Default fallback
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
}
